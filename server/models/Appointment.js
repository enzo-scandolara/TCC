const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

  date: { type: Date, required: true},

  service: {type: String, required: true},

  notes: String,
  
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'concluído'],
    default: 'pendente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
