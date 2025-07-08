const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {type: String, required: true,},
  email: {type: String, required: true, unique: true,},
  senha: {type: String, required: true,},
  tipo: {type: String, enum: ['cliente', 'funcionario', 'admin'], default: 'cliente',},
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
