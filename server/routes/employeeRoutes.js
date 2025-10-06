// server/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, somenteAdmin } = require('../middleware/authMiddleware');
const {
  getAvailableEmployees,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployeeWorkSchedule,
  updateEmployeeStatus
} = require('../controllers/employeeController');

// Rota pública para funcionários disponíveis (usada no agendamento)
router.get('/disponiveis', getAvailableEmployees);

// Rotas protegidas
router.get('/', authMiddleware, getEmployees); // Listar todos os funcionários
router.get('/:id', authMiddleware, getEmployeeById); // Buscar funcionário por ID
router.post('/', authMiddleware, somenteAdmin, createEmployee); // Criar funcionário
router.put('/:id/horario', authMiddleware, somenteAdmin, updateEmployeeWorkSchedule); // Atualizar horário
router.put('/:id/status', authMiddleware, somenteAdmin, updateEmployeeStatus);

module.exports = router;