const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

// Rotas dos agendamentos. O próprio nome do controller que ela usa diz sua função
// mais caso vocês se confundam, sugiro comentar as rotas igual os controllers.

router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointments);
router.get('/:id', authMiddleware, getAppointmentById);
router.put('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

module.exports = router;
