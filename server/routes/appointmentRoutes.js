const express = require('express');
const router = express.Router();
const { authMiddleware, funcionarioOuAdmin } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getEmployeeAppointments,
  updateAppointmentStatus,
  getEmployeeStats // ✅ JÁ ESTÁ IMPORTADO
} = require('../controllers/appointmentController');

router.get('/health', (req, res) => {
  res.json({ 
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// ROTAS EXISTENTES
router.get('/horarios-disponiveis', authMiddleware, getAvailableSlots);
router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointments);
router.get('/:id', authMiddleware, getAppointmentById);
router.put('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);

// ROTAS DO FUNCIONÁRIO
router.get('/employee/my-appointments', authMiddleware, funcionarioOuAdmin, getEmployeeAppointments);
router.get('/employee/stats', authMiddleware, funcionarioOuAdmin, getEmployeeStats); // ✅ NOVA ROTA
router.put('/:id/status', authMiddleware, funcionarioOuAdmin, updateAppointmentStatus);

module.exports = router;