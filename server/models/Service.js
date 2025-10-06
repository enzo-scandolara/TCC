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
    type: Number, // em minutos
    required: true,
    min: 15,
    max: 240 // 4 horas máximo
  },
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    enum: ['Corte', 'Barba', 'Sobrancelha', 'Combo', 'Outros'],
    required: true
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);