const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {
    type: String, 
    required: true
  },
  email: {
    type: String, 
    required: true, 
    unique: true
  },
  senha: {
    type: String, 
    required: true
  },
  tipo: {
    type: String, 
    enum: ['cliente', 'funcionario', 'admin'], 
    default: 'cliente'
  },
 
  especializacoes: [{
    type: String,
    
  }],
  horarioTrabalho: {
    inicio: { 
      type: String, 
    },
    fim: { 
      type: String, 
    }
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);