const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// BUSCAR AGENDAMENTOS
const getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('service', 'nome descricao duracao preco categoria')
      .populate('client', 'nome email')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// CRIAR AGENDAMENTO
const createAppointment = async (req, res) => {
  try {
    const { service, client, date, notes } = req.body;

    const appointment = new Appointment({
      service,
      client, 
      date,
      notes: notes || `Serviço agendado`
    });

    await appointment.save();
    
    await appointment.populate('service', 'nome descricao duracao preco categoria');
    await appointment.populate('client', 'nome email');

    res.status(201).json({
      mensagem: 'Agendamento criado com sucesso',
      appointment
    });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados de agendamento inválidos' });
    }
    
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//  BUSCAR AGENDAMENTO POR ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service', 'nome descricao duracao preco categoria')
      .populate('client', 'nome email');

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//  ATUALIZAR AGENDAMENTO
const updateAppointment = async (req, res) => {
  try {
    const { service, date, notes, status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { service, date, notes, status },
      { new: true, runValidators: true }
    )
      .populate('service', 'nome descricao duracao preco categoria')
      .populate('client', 'nome email');

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    res.json({
      mensagem: 'Agendamento atualizado com sucesso',
      appointment
    });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados de agendamento inválidos' });
    }
    
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//  DELETAR AGENDAMENTO
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};


module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
};