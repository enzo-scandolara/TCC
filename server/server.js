// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const { PORT } = require('./config');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/agendamentos', appointmentRoutes);
app.use('/api/services', serviceRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
