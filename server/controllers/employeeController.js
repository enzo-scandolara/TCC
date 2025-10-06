// server/controllers/employeeController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// BUSCAR FUNCIONÁRIOS DISPONÍVEIS
const getAvailableEmployees = async (req, res) => {
  try {
    const { date, time, serviceDuration } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({ mensagem: 'Data e horário são obrigatórios' });
    }

    // 1. Buscar todos os funcionários ativos
    const employees = await User.find({ 
      tipo: 'funcionario', 
      ativo: true 
    });

    // 2. Converter horário para minutos para facilitar cálculos
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestedTimeMinutes = timeToMinutes(time);
    const serviceDurationMinutes = parseInt(serviceDuration) || 30; // default 30min

    // 3. Filtrar funcionários disponíveis
    const availableEmployees = [];

    for (const employee of employees) {
      const { horarioTrabalho, horarioAlmoco, fimHorarioAlmoco } = employee;
      
      if (!horarioTrabalho.inicio || !horarioTrabalho.fim) {
        continue; // Funcionário sem horário definido
      }

      const workStartMinutes = timeToMinutes(horarioTrabalho.inicio);
      const workEndMinutes = timeToMinutes(horarioTrabalho.fim);
      const lunchStartMinutes = horarioAlmoco ? timeToMinutes(horarioAlmoco) : null;
      const lunchEndMinutes = fimHorarioAlmoco ? timeToMinutes(fimHorarioAlmoco) : null;

      // Verificar se está dentro do horário de trabalho
      const isWithinWorkHours = requestedTimeMinutes >= workStartMinutes && 
                               requestedTimeMinutes <= workEndMinutes;

      // Verificar se NÃO está no horário de almoço
      const isLunchTime = lunchStartMinutes && lunchEndMinutes &&
                         requestedTimeMinutes >= lunchStartMinutes && 
                         requestedTimeMinutes <= lunchEndMinutes;

      // Verificar se o serviço cabe no horário (não ultrapassa o expediente)
      const serviceEndMinutes = requestedTimeMinutes + serviceDurationMinutes;
      const fitsInWorkSchedule = serviceEndMinutes <= workEndMinutes;

      // Verificar se não invade o horário de almoço
      const conflictsWithLunch = lunchStartMinutes && lunchEndMinutes &&
                                (requestedTimeMinutes < lunchEndMinutes && 
                                 serviceEndMinutes > lunchStartMinutes);

      if (isWithinWorkHours && !isLunchTime && fitsInWorkSchedule && !conflictsWithLunch) {
        // 4. Verificar se não tem agendamento conflitante
        const conflictingAppointment = await Appointment.findOne({
          barber: employee._id,
          date: new Date(date),
          $or: [
            {
              $and: [
                { date: { $lte: new Date(`${date}T${time}:00`) } },
                { date: { 
                  $gte: new Date(new Date(`${date}T${time}:00`).getTime() - (serviceDurationMinutes * 60000))
                } }
              ]
            }
          ]
        });

        if (!conflictingAppointment) {
          availableEmployees.push({
            _id: employee._id,
            nome: employee.nome,
            especializacoes: employee.especializacoes,
            horarioTrabalho: employee.horarioTrabalho,
            horarioAlmoco: employee.horarioAlmoco,
            fimHorarioAlmoco: employee.fimHorarioAlmoco
          });
        }
      }
    }

    res.json(availableEmployees);
  } catch (error) {
    console.error('Erro ao buscar funcionários disponíveis:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};
const updateEmployeeStatus = async (req, res) => {
  try {
    const { ativo } = req.body;

    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, tipo: 'funcionario' },
      { ativo },
      { new: true, runValidators: true }
    ).select('-senha');

    if (!employee) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado' });
    }

    res.json({
      mensagem: `Funcionário ${ativo ? 'ativado' : 'desativado'} com sucesso`,
      employee
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};
// LISTAR TODOS OS FUNCIONÁRIOS
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ tipo: 'funcionario' })
      .select('-senha') // Não retornar a senha
      .sort({ nome: 1 });

    res.json(employees);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// BUSCAR FUNCIONÁRIO POR ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findOne({ 
      _id: req.params.id, 
      tipo: 'funcionario' 
    }).select('-senha');

    if (!employee) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// CRIAR FUNCIONÁRIO
const createEmployee = async (req, res) => {
  try {
    const { nome, email, senha, especializacoes, horarioTrabalho, horarioAlmoco, fimHorarioAlmoco } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ mensagem: 'Email já cadastrado' });
    }

    const employee = new User({
      nome,
      email,
      senha, // Em produção, criptografar a senha
      tipo: 'funcionario',
      especializacoes: especializacoes || [],
      horarioTrabalho: horarioTrabalho || { inicio: '08:00', fim: '20:00' },
      horarioAlmoco: horarioAlmoco || '12:00',
      fimHorarioAlmoco: fimHorarioAlmoco || '13:00',
      ativo: true
    });

    await employee.save();

    // Retornar sem a senha
    const employeeResponse = employee.toObject();
    delete employeeResponse.senha;

    res.status(201).json({
      mensagem: 'Funcionário criado com sucesso',
      employee: employeeResponse
    });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados inválidos' });
    }
    
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// ATUALIZAR HORÁRIO DE TRABALHO
const updateEmployeeWorkSchedule = async (req, res) => {
  try {
    const { inicio, fim, horarioAlmoco, fimHorarioAlmoco } = req.body;

    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, tipo: 'funcionario' },
      { 
        horarioTrabalho: { inicio, fim },
        horarioAlmoco,
        fimHorarioAlmoco
      },
      { new: true, runValidators: true }
    ).select('-senha');

    if (!employee) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado' });
    }

    res.json({
      mensagem: 'Horário atualizado com sucesso',
      employee
    });
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

module.exports = {
  getAvailableEmployees,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployeeWorkSchedule,
  updateEmployeeStatus
};