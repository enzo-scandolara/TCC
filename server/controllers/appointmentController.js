const Appointment = require('../models/Appointment');

// Criar novo agendamento
const createAppointment = async (req, res) => {
  const { date, service, notes } = req.body;

  try {
    const newAppointment = new Appointment({
      client: req.userId,
      date,
      service,
      notes,
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar agendamento' });
  }
};

// Listar agendamentos, permitindo o filtro de status (agendamento pendente, concluido etc)
const getAppointments = async (req, res) => {
  const userId = req.userId;
  const { status } = req.query;

  const filtro = { client: userId };
  if (status) filtro.status = status;

  try {
    const agendamentos = await Appointment.find(filtro).sort({ date: 1 });
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos' });
  }
};

// Buscar agendamento por ID
const getAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findOne({ _id: id, client: req.userId });

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar agendamento' });
  }
};

// Editar agendamento
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, service, notes } = req.body;

  try {
    const appointment = await Appointment.findOne({ _id: id, client: req.userId });

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    if (date) appointment.date = date;
    if (service) appointment.service = service;
    if (notes) appointment.notes = notes;

    await appointment.save();

    res.json({ mensagem: 'Agendamento atualizado com sucesso', agendamento: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar agendamento' });
  }
};

// Deletar agendamento
const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findOneAndDelete({ _id: id, client: req.userId });

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    res.json({ mensagem: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar agendamento' });
  }
};


module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
