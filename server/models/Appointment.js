// server/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: true
  },
  barber: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true  
  },
  date: { 
    type: Date, 
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['pendente', 'concluído', 'cancelado'], // ✅ REMOVIDO 'confirmado'
    default: 'pendente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);