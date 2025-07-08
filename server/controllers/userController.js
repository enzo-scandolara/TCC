const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

// Realizar login
const loginUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const token = jwt.sign(
      { userId: usuario._id, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//Realizar registro
const registerUser = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try {
    const userExistente = await User.findOne({ email });

    if (userExistente) {
      return res.status(400).json({ mensagem: 'Usuário já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new User({
      nome,
      email,
      senha: senhaHash,
      tipo,
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};


module.exports = {
  loginUser,
  registerUser,
};
