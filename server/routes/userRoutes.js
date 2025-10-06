const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/userController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginUser);
router.post('/register', registerUser);

// 🔧 ROTA PARA VER O HASH CORRETO
router.get('/debug-senha', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash('123456', salt);
    
    // Testa se o hash funciona
    const senhaValida = await bcrypt.compare('123456', senhaHash);
    
    res.json({
      mensagem: 'Hash gerado com SUCESSO',
      senha_teste: '123456',
      hash_gerado: senhaHash,
      hash_funciona: senhaValida,
      instrucoes: 'Use este hash no MongoDB'
    });
  } catch (error) {
    res.status(500).json({ mensagem: error.message });
  }
});

module.exports = router;
