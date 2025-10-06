const express = require('express');
const router = express.Router();
const { authMiddleware, somenteAdmin } = require('../middleware/authMiddleware'); 
const {
  loginUser,
  registerUser,
  registerFuncionario,
  getFuncionarios,
  getMe 
} = require('../controllers/userController');

//  ROTAS PÚBLICAS
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/funcionarios', getFuncionarios); 
// ROTAS PROTEGIDAS
router.get('/me', authMiddleware, getMe);
router.post('/funcionarios', authMiddleware, somenteAdmin, registerFuncionario); 

module.exports = router;