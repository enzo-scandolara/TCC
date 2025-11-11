const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

// Realizar login
const loginUser = async (req, res) => {
  const { email, senha } = req.body;

  console.log(req.body);
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
    console.log(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
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
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//REGISTRO DE FUNCIONÁRIOS (somente admin)
const registerFuncionario = async (req, res) => {
  //VERIFICAÇÃO: Só admin pode acessar (já feita pelo middleware)
  const { nome, email, senha, especializacoes, horarioTrabalho } = req.body;

// ✅ DEBUG: VER O QUE ESTÁ CHEGANDO
  console.log('=== DEBUG REGISTER FUNCIONARIO ===');
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('senha recebida:', senha);
  console.log('tipo da senha:', typeof senha);


  try {
    const userExistente = await User.findOne({ email });

    if (userExistente) {
      return res.status(400).json({ mensagem: 'Usuário já cadastrado' });
    }

    // ✅ CORREÇÃO: FAZER HASH DA SENHA (igual no registerUser)
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoFuncionario = new User({
      nome,
      email,
      senha: senhaHash, // ← AGORA COM HASH
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

// OBTER DADOS DO USUÁRIO LOGADO
const getMe = async (req, res) => {
  try {
    // O middleware authMiddleware já adicionou userId e userTipo no request
    const user = await User.findById(req.userId).select('-senha'); // Remove a senha do resultado
    
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.json({
      _id: user._id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      especializacoes: user.especializacoes,
      horarioTrabalho: user.horarioTrabalho,
      ativo: user.ativo,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Adicione no userController.js - TESTE CONTROLADO
const debugRegister = async (req, res) => {
  try {
    console.log('=== TESTE CONTROLADO ===');
    
    // Dados fixos para teste
    const testData = {
      nome: 'Funcionario Teste',
      email: 'funcionario@teste.com', 
      senha: '123456',
      tipo: 'funcionario'
    };

    console.log('1. Dados de teste:', testData);

    // Verificar se usuário já existe
    const existing = await User.findOne({ email: testData.email });
    if (existing) {
      await User.deleteOne({ email: testData.email });
      console.log('2. Usuário teste anterior removido');
    }

    console.log('3. Gerando hash...');
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(testData.senha, salt);
    console.log('4. Hash gerado:', senhaHash.substring(0, 20) + '...');

    // Criar usuário manualmente
    const user = new User({
      nome: testData.nome,
      email: testData.email,
      senha: senhaHash,
      tipo: testData.tipo
    });

    console.log('5. Antes do save - senha no objeto:', user.senha.substring(0, 20) + '...');
    await user.save();
    console.log('6. Após save');

    // Verificar o que foi salvo
    const savedUser = await User.findOne({ email: testData.email });
    console.log('7. Usuário salvo - senha:', savedUser.senha);
    console.log('8. É hash?', savedUser.senha.startsWith('$2b$'));
    console.log('9. Comparação com senha original:', await bcrypt.compare(testData.senha, savedUser.senha));

    // Limpar
    await User.deleteOne({ email: testData.email });
    console.log('10. Usuário teste removido');
    console.log('=== FIM TESTE ===');

    res.json({ 
      success: true, 
      senha_salva: savedUser.senha,
      eh_hash: savedUser.senha.startsWith('$2b$'),
      comparacao_valida: await bcrypt.compare(testData.senha, savedUser.senha)
    });

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  registerFuncionario, 
  getFuncionarios,
  getMe,
  debugRegister
};