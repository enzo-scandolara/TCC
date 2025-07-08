import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewAppointment from './pages/NewAppointment';
import PendingAppointments from './pages/PendingAppointments';
import CompletedAppointments from './pages/CompletedAppointments';
import EditAppointment from './pages/EditAppointment';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={(token) => { localStorage.setItem('token', token); setToken(token); }} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agendar" element={token ? <NewAppointment /> : <Navigate to="/login" replace />} />
        <Route path="/agendamentos/pendentes" element={token ? <PendingAppointments /> : <Navigate to="/login" replace />} />
        <Route path="/agendamentos/concluidos" element={token ? <CompletedAppointments /> : <Navigate to="/login" replace />} />
        <Route path="/agendamentos/editar/:id" element={token ? <EditAppointment /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
