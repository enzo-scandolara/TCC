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
    res.status(500).json({ mensagem: 'Erro no servidor' }); //Preciso melhorar essa parte de erros ia ser top
  }
};

//Realizar registro
const registerUser = async (req, res) => {
  const { nome, email, senha } = req.body; //Removi "tipo" do body por segurança

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
      tipo: 'cliente', //Forçando sempre "cliente" e tals
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' }); //Preciso melhorar essa parte de erros ia ser top
  }
};


//REGISTRO DE FUNCIONÁRIOS (somente admin)
const registerFuncionario = async (req, res) => {
  //VERIFICAÇÃO: Só admin pode acessar (já feita pelo middleware)
  const { nome, email, senha, especializacoes, horarioTrabalho } = req.body;

  try {
    const userExistente = await User.findOne({ email });

    if (userExistente) {
      return res.status(400).json({ mensagem: 'Usuário já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoFuncionario = new User({
      nome,
      email,
      senha: senhaHash,
      tipo: 'funcionario', // Especificamente como funcionário
      especializacoes: especializacoes || [],
      horarioTrabalho: horarioTrabalho || { inicio: '08:00', fim: '20:00' }
    });

    await novoFuncionario.save();

    // Retorna sem a senha, por segurança
    res.status(201).json({
      mensagem: 'Funcionário cadastrado com sucesso',
      funcionario: {
        _id: novoFuncionario._id,
        nome: novoFuncionario.nome,
        email: novoFuncionario.email,
        tipo: novoFuncionario.tipo,
        especializacoes: novoFuncionario.especializacoes,
        horarioTrabalho: novoFuncionario.horarioTrabalho
      }
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//LISTAR FUNCIONÁRIOS (público ou autenticado)
const getFuncionarios = async (req, res) => {
  try {
    const funcionarios = await User.find({ 
      tipo: 'funcionario', 
      ativo: true 
    }).select('-senha'); // Remove a senha do resultado

    res.json(funcionarios);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  registerFuncionario, // ← novo
  getFuncionarios      // ← novo
};