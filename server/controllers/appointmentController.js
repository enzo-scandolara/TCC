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
      filter.client = userId;
    } else if (userTipo === 'funcionario') {
      filter.barber = userId;
    }

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

// GET AGENDAMENTOS DO FUNCIONÁRIO - CORRIGIDO
const getEmployeeAppointments = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const employeeId = req.userId;
    
    let query = { barber: employeeId };
    
    // Filtro por range de datas
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Fallback: agendamentos dos próximos 30 dias
      const today = new Date();
      query.date = {
        $gte: today,
        $lte: new Date(today.setDate(today.getDate() + 30))
      };
    }
    
    // Filtro por status se fornecido
    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('client', 'nome email telefone')
      .populate('service', 'nome duracao preco')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos do funcionário:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
};

// ATUALIZAR STATUS DO AGENDAMENTO
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointmentId = req.params.id;
    const employeeId = req.userId;

    const appointment = await Appointment.findById(appointmentId)
      .populate('service', 'nome duracao')
      .populate('client', 'nome email');

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    if (appointment.barber.toString() !== employeeId) {
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Este agendamento não é seu.' 
      });
    }

    const validTransitions = {
      'pendente': ['confirmado', 'concluído', 'cancelado'],
      'confirmado': ['concluído', 'cancelado'],
      'concluído': [],
      'cancelado': []
    };

    if (!validTransitions[appointment.status].includes(status)) {
      return res.status(400).json({ 
        mensagem: `Transição de status inválida: ${appointment.status} → ${status}` 
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        status,
        notes: notes || appointment.notes 
      },
      { new: true, runValidators: true }
    )
      .populate('service', 'nome descricao duracao preco categoria')
      .populate('client', 'nome email telefone')
      .populate('barber', 'nome email');

    res.json({
      mensagem: `Agendamento ${status} com sucesso`,
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados inválidos' });
    }
    
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// CRIAR AGENDAMENTO
const createAppointment = async (req, res) => {
  try {
    const { service, client, barber, date, notes } = req.body;

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

    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(400).json({ 
        mensagem: 'Serviço não encontrado' 
      });
    }

    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + (serviceData.duracao * 60000));

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

    if (appointmentTimeMinutes < workStartMinutes || endTimeMinutes > workEndMinutes) {
      return res.status(400).json({ 
        mensagem: `Horário fora do expediente do barbeiro` 
      });
    }

    if ((appointmentTimeMinutes < lunchEndMinutes && endTimeMinutes > lunchStartMinutes)) {
      return res.status(400).json({ 
        mensagem: `Horário conflita com horário de almoço` 
      });
    }

    const appointment = new Appointment({
      service,
      client, 
      barber,
      date: appointmentDate,
      notes: notes || `Serviço: ${serviceData.nome}`,
      status: 'pendente'
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

// ATUALIZAR AGENDAMENTO 
const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;

    const existingAppointment = await Appointment.findById(req.params.id);
    
    if (!existingAppointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

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

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
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

// DELETAR AGENDAMENTO 
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

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

    const barbers = await User.find({ 
      tipo: 'funcionario', 
      ativo: true 
    });

    const serviceDurationMinutes = parseInt(serviceDuration);
    const availableSlots = [];

    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

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

    for (const barber of barbers) {
      const barberSlots = [];

      for (const timeSlot of allTimeSlots) {
        const timeMinutes = timeToMinutes(timeSlot);
        const endTimeMinutes = timeMinutes + serviceDurationMinutes;

        const workStartMinutes = timeToMinutes(barber.horarioTrabalho.inicio || '08:00');
        const workEndMinutes = timeToMinutes(barber.horarioTrabalho.fim || '20:00');
        const lunchStartMinutes = timeToMinutes(barber.horarioAlmoco || '12:00');
        const lunchEndMinutes = timeToMinutes(barber.fimHorarioAlmoco || '13:00');

        const isWithinWorkHours = timeMinutes >= workStartMinutes && endTimeMinutes <= workEndMinutes;
        const isNotLunchTime = !(timeMinutes < lunchEndMinutes && endTimeMinutes > lunchStartMinutes);

        if (isWithinWorkHours && isNotLunchTime) {
          const appointmentDateTime = new Date(`${date}T${timeSlot}:00`);
          const appointmentEndDateTime = new Date(appointmentDateTime.getTime() + (serviceDurationMinutes * 60000));

          const conflictingAppointment = await Appointment.findOne({
            barber: barber._id,
            date: {
              $lt: appointmentEndDateTime,
              $gte: appointmentDateTime
            },
            status: { $in: ['pendente', 'confirmado'] }
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

// ✅ ESTATÍSTICAS DO FUNCIONÁRIO - NOVA FUNÇÃO
const getEmployeeStats = async (req, res) => {
  try {
    const employeeId = req.userId;
    
    // Data de hoje (início e fim do dia)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    console.log('📊 Buscando stats para funcionário:', employeeId);
    console.log('📅 Período:', startOfDay, 'até', endOfDay);

    // Buscar agendamentos do funcionário para hoje
    const appointments = await Appointment.find({
      barber: employeeId,
      date: { 
        $gte: startOfDay, 
        $lte: endOfDay 
      }
    });

    console.log('📋 Agendamentos encontrados:', appointments.length);

    // Calcular estatísticas
    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pendente').length,
      confirmed: appointments.filter(a => a.status === 'confirmado').length,
      completed: appointments.filter(a => a.status === 'concluído').length,
      cancelled: appointments.filter(a => a.status === 'cancelado').length
    };

    console.log('✅ Stats calculados:', stats);

    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar estatísticas', 
      error: error.message 
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getEmployeeAppointments,
  updateAppointmentStatus,
  getEmployeeStats 
};