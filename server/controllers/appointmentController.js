// server/controllers/appointmentController.js
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

// GET AGENDAMENTOS DO FUNCIONÁRIO
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

// BUSCAR HORÁRIOS DISPONÍVEIS - CORRIGIDO
const getAvailableSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    
    if (!date || !serviceId) {
      return res.status(400).json({ mensagem: 'Data e serviço são obrigatórios' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).json({ mensagem: 'Serviço não encontrado' });
    }

    const serviceDuration = service.duracao; // 30 ou 60
    const barbers = await User.find({ 
      tipo: 'funcionario', 
      ativo: true 
    });

    const availableSlots = [];
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];

    // Função auxiliar para converter tempo em minutos
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    for (const barber of barbers) {
      // Busca todos os agendamentos do barbeiro naquele dia
      const startOfDay = new Date(date + 'T00:00:00');
      const endOfDay = new Date(date + 'T23:59:59');
      
      const existingAppointments = await Appointment.find({
        barber: barber._id,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['pendente', 'confirmado'] }
      }).populate('service', 'duracao');

      // Cria um mapa de slots ocupados (30 min cada)
      const occupiedSlots = new Set();
      
      existingAppointments.forEach(appointment => {
        const appointmentStart = appointment.date;
        const appointmentDuration = appointment.service.duracao;
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointmentDuration * 60000));
        
        // Marca todos os slots de 30min que estão ocupados
        let currentSlot = new Date(appointmentStart);
        while (currentSlot < appointmentEnd) {
          const slotTime = currentSlot.toTimeString().slice(0, 5); // "08:00"
          occupiedSlots.add(`${barber._id}-${slotTime}`);
          
          // Próximo slot de 30min
          currentSlot = new Date(currentSlot.getTime() + (30 * 60000));
        }
      });

      // Verifica cada slot de 30min
      for (let hour = 8; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Verifica se é no passado
          if (date === today) {
            const slotDateTime = new Date(`${date}T${time}:00`);
            if (slotDateTime <= now) continue;
          }

          // Verifica se tem slots consecutivos disponíveis
          const slotsNeeded = serviceDuration / 30; // 1 ou 2
          let allSlotsAvailable = true;
          
          for (let i = 0; i < slotsNeeded; i++) {
            const slotHour = hour + Math.floor((minute + i * 30) / 60);
            const slotMinute = (minute + i * 30) % 60;
            const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
            
            // Verifica se este slot está ocupado
            if (occupiedSlots.has(`${barber._id}-${slotTime}`)) {
              allSlotsAvailable = false;
              break;
            }
            
            // Verifica se está dentro do horário de trabalho
            const slotStartMinutes = timeToMinutes(slotTime);
            const slotEndMinutes = slotStartMinutes + 30;
            
            const workStartMinutes = timeToMinutes(barber.horarioTrabalho.inicio || '08:00');
            const workEndMinutes = timeToMinutes(barber.horarioTrabalho.fim || '20:00');
            const lunchStartMinutes = timeToMinutes(barber.horarioAlmoco || '12:00');
            const lunchEndMinutes = timeToMinutes(barber.fimHorarioAlmoco || '13:00');
            
            const isWithinWorkHours = slotStartMinutes >= workStartMinutes && slotEndMinutes <= workEndMinutes;
            const isNotLunchTime = !(slotStartMinutes < lunchEndMinutes && slotEndMinutes > lunchStartMinutes);
            
            if (!isWithinWorkHours || !isNotLunchTime) {
              allSlotsAvailable = false;
              break;
            }
          }

          if (allSlotsAvailable) {
            availableSlots.push({
              barberId: barber._id.toString(),
              time: time,
              barberName: barber.nome,
              duration: serviceDuration
            });
          }
        }
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

// CRIAR AGENDAMENTO - CORRIGIDO
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

    // ✅ VALIDAÇÃO EXTRA: VERIFICA SE OS SLOTS CONSECUTIVOS ESTÃO LIVRES
    const slotsNeeded = serviceData.duracao / 30;
    let currentSlot = new Date(appointmentDate);
    
    for (let i = 0; i < slotsNeeded; i++) {
      const slotEnd = new Date(currentSlot.getTime() + (30 * 60000));
      
      const conflictingAppointment = await Appointment.findOne({
        barber: barber,
        date: {
          $lt: slotEnd,
          $gte: currentSlot
        },
        status: { $in: ['pendente', 'confirmado'] }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ 
          mensagem: `Barbeiro já possui agendamento que conflita com este horário` 
        });
      }
      
      // Próximo slot
      currentSlot = new Date(currentSlot.getTime() + (30 * 60000));
    }

    // Validações de horário de trabalho
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
      notes: notes || `Serviço: ${serviceData.nome} (${serviceData.duracao}min)`,
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

// ESTATÍSTICAS DO FUNCIONÁRIO
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