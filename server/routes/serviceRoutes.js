const express = require('express');
const router = express.Router();
const { authMiddleware, somenteAdmin } = require('../middleware/authMiddleware');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// ROTAS PÚBLICAS
router.get('/', getServices); // Listar todos os serviços ativos
router.get('/:id', getServiceById); // Buscar serviço por ID

// ROTAS PROTEGIDAS (somente admin)
router.post('/', authMiddleware, somenteAdmin, createService); // Criar serviço
router.put('/:id', authMiddleware, somenteAdmin, updateService); // Atualizar serviço
router.delete('/:id', authMiddleware, somenteAdmin, deleteService); // Desativar serviço

module.exports = router;