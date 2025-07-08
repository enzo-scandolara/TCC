const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/userController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginUser);
router.post('/register', registerUser);

module.exports = router;
