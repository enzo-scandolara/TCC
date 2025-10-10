const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');

// BUSCAR AGENDAMENTOS
const getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.userId;
    const userTipo = req.userTipo;

    let filter = {};
    
    if (status) {
      filter.status = status;
    }

    // FILTRAGEM POR TIPO DE USUÁRIO 
    if (userTipo === 'cliente') {
      // Cliente vê apenas SEUS agendamentos
      filter.client = userId;
    } else if (userTipo === 'funcionario') {
      // Funcionário vê agendamentos atribuídos a ELE
      filter.barber = userId;
    }
    // Admin vê TODOS os agendamentos - sem filtro adicional

    const appointments = await Appointment.find(filter)
      .populate('service', 'nome descricao duracao preco categoria')
      .populate('client', 'nome email')
      .populate('barber', 'nome email')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// CRIAR AGENDAMENTO
const createAppointment = async (req, res) => {
  try {
    const { service, client, barber, date, notes } = req.body;

    // ✅ VERIFICAR SE O BARBEIRO EXISTE E ESTÁ ATIVO
    const barberExists = await User.findOne({ 
      _id: barber, 
      tipo: 'funcionario', 
      ativo: true 
    });
    
    if (!barberExists) {
      return res.status(400).json({ 
        mensagem: 'Barbeiro não encontrado ou inativo' 
      });
    }

    // ✅ BUSCAR DADOS DO SERVIÇO PARA SABER A DURAÇÃO
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(400).json({ 
        mensagem: 'Serviço não encontrado' 
      });
    }

    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + (serviceData.duracao * 60000));

    // ✅ VERIFICAR CONFLITO DE HORÁRIO
    const conflictingAppointment = await Appointment.findOne({
      barber: barber,
      date: {
        $lt: appointmentEnd,
        $gte: appointmentDate
      },
      status: { $in: ['pendente', 'confirmado'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        mensagem: `Barbeiro já possui agendamento neste horário` 
      });
    }

    // ✅ VERIFICAR HORÁRIO DE TRABALHO DO BARBEIRO
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const appointmentTime = appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const appointmentTimeMinutes = timeToMinutes(appointmentTime);
    const endTimeMinutes = timeToMinutes(appointmentTime) + serviceData.duracao;

    const workStartMinutes = timeToMinutes(barberExists.horarioTrabalho.inicio || '08:00');
    const workEndMinutes = timeToMinutes(barberExists.horarioTrabalho.fim || '20:00');
    const lunchStartMinutes = timeToMinutes(barberExists.horarioAlmoco || '12:00');
    const lunchEndMinutes = timeToMinutes(barberExists.fimHorarioAlmoco || '13:00');

    // Verificar se está dentro do horário de trabalho
    if (appointmentTimeMinutes < workStartMinutes || endTimeMinutes > workEndMinutes) {
      return res.status(400).json({ 
        mensagem: `Horário fora do expediente do barbeiro` 
      });
    }

    // Verificar se não invade horário de almoço
    if ((appointmentTimeMinutes < lunchEndMinutes && endTimeMinutes > lunchStartMinutes)) {
      return res.status(400).json({ 
        mensagem: `Horário conflita com horário de almoço` 
      });
    }

    // ✅ CRIAR AGENDAMENTO
    const appointment = new Appointment({
      service,
      client, 
      barber,
      date: appointmentDate,
      notes: notes || `Serviço: ${serviceData.nome}`,
      status: 'pendente' // ✅ SEMPRE COMEÇA COMO PENDENTE
    });

    await appointment.save();
    
    await appointment.populate('service', 'nome descricao duracao preco categoria');
    await appointment.populate('client', 'nome email');
    await appointment.populate('barber', 'nome email');

    res.status(201).json({
      mensagem: 'Agendamento criado com sucesso',
      appointment
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados de agendamento inválidos' });
    }
    
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// BUSCAR AGENDAMENTO POR ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service', 'nome descricao duracao preco categoria')
      .populate('client', 'nome email')
      .populate('barber', 'nome email');

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    // ✅ VERIFICAÇÃO SIMPLES DE PERMISSÃO
    const userId = req.userId;
    const userTipo = req.userTipo;
    
    const canAccess = 
      userTipo === 'admin' ||
      (userTipo === 'cliente' && appointment.client._id.toString() === userId) ||
      (userTipo === 'funcionario' && appointment.barber._id.toString() === userId);

    if (!canAccess) {
      return res.status(403).json({ 
        mensagem: 'Acesso negado a este agendamento' 
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// ATUALIZAR AGENDAMENTO - SIMPLIFICADO (APENAS STATUS PARA CANCELAR)
const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body; // ✅ APENAS STATUS (para cancelar)

    // Buscar agendamento existente
    const existingAppointment = await Appointment.findById(req.params.id);
    
    if (!existingAppointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    // Verificação de permissão
    const userId = req.userId;
    const userTipo = req.userTipo;
    
    const canEdit = 
      userTipo === 'admin' ||
      (userTipo === 'cliente' && existingAppointment.client.toString() === userId) ||
      (userTipo === 'funcionario' && existingAppointment.barber.toString() === userId);

    if (!canEdit) {
      return res.status(403).json({ 
        mensagem: 'Sem permissão para editar este agendamento' 
      });
    }

    // ✅ APENAS PERMITIR MUDANÇA DE STATUS (cancelar)
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status }, // ✅ APENAS STATUS
      { new: true, runValidators: true }
    )
      .populate('service', 'nome descricao duracao preco categoria')
      .populate('client', 'nome email')
      .populate('barber', 'nome email');

    res.json({
      mensagem: 'Agendamento atualizado com sucesso',
      appointment
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados de agendamento inválidos' });
    }
    
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// DELETAR AGENDAMENTO - SIMPLIFICADO
const deleteAppointment = async (req, res) => {
  try {
    // ✅ BUSCAR AGENDAMENTO
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    // ✅ VERIFICAÇÃO SIMPLES DE PERMISSÃO
    const userId = req.userId;
    const userTipo = req.userTipo;
    
    const canDelete = 
      userTipo === 'admin' ||
      (userTipo === 'cliente' && appointment.client.toString() === userId);

    if (!canDelete) {
      return res.status(403).json({ 
        mensagem: 'Sem permissão para excluir este agendamento' 
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// BUSCAR HORÁRIOS DISPONÍVEIS
const getAvailableSlots = async (req, res) => {
  try {
    const { date, serviceDuration } = req.query;
    
    if (!date || !serviceDuration) {
      return res.status(400).json({ mensagem: 'Data e duração do serviço são obrigatórios' });
    }

    // Buscar todos os barbeiros ativos
    const barbers = await User.find({ 
      tipo: 'funcionario', 
      ativo: true 
    });

    const serviceDurationMinutes = parseInt(serviceDuration);
    const availableSlots = [];

    // Função para converter horário em minutos
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Gerar todos os horários possíveis do dia
    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 8; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
      return slots;
    };

    const allTimeSlots = generateTimeSlots();

    // Para cada barbeiro, verificar disponibilidade
    for (const barber of barbers) {
      const barberSlots = [];

      for (const timeSlot of allTimeSlots) {
        const timeMinutes = timeToMinutes(timeSlot);
        const endTimeMinutes = timeMinutes + serviceDurationMinutes;

        // Verificar horário de trabalho
        const workStartMinutes = timeToMinutes(barber.horarioTrabalho.inicio || '08:00');
        const workEndMinutes = timeToMinutes(barber.horarioTrabalho.fim || '20:00');
        const lunchStartMinutes = timeToMinutes(barber.horarioAlmoco || '12:00');
        const lunchEndMinutes = timeToMinutes(barber.fimHorarioAlmoco || '13:00');

        // Verificar se está dentro do expediente e fora do almoço
        const isWithinWorkHours = timeMinutes >= workStartMinutes && endTimeMinutes <= workEndMinutes;
        const isNotLunchTime = !(timeMinutes < lunchEndMinutes && endTimeMinutes > lunchStartMinutes);

        if (isWithinWorkHours && isNotLunchTime) {
          // Verificar se não há conflito com agendamentos existentes
          const appointmentDateTime = new Date(`${date}T${timeSlot}:00`);
          const appointmentEndDateTime = new Date(appointmentDateTime.getTime() + (serviceDurationMinutes * 60000));

          const conflictingAppointment = await Appointment.findOne({
            barber: barber._id,
            date: {
              $lt: appointmentEndDateTime,
              $gte: appointmentDateTime
            },
            status: { $in: ['pendente'] } // ✅ APENAS VERIFICA CONFLITO COM AGENDAMENTOS PENDENTES
          });

          if (!conflictingAppointment) {
            barberSlots.push({
              barberId: barber._id.toString(),
              time: timeSlot,
              barberName: barber.nome
            });
          }
        }
      }

      // Se o barbeiro tem horários disponíveis, adicionar à lista
      if (barberSlots.length > 0) {
        availableSlots.push(...barberSlots);
      }
    }

    res.json({
      barbers: barbers.map(b => ({
        _id: b._id,
        nome: b.nome,
        especializacoes: b.especializacoes,
        horarioTrabalho: b.horarioTrabalho,
        horarioAlmoco: b.horarioAlmoco,
        fimHorarioAlmoco: b.fimHorarioAlmoco
      })),
      availableSlots
    });

  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots
};