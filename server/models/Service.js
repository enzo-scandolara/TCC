// server/models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  duracao: {
    type: Number,
    required: true,
    enum: [30, 60], // ✅ APENAS 30 OU 60 MINUTOS
    default: 30
  },
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    default: 'Geral'
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);