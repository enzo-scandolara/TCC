import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import NewAppointment from './pages/NewAppointment';
import PendingAppointments from './pages/PendingAppointments';
import CompletedAppointments from './pages/CompletedAppointments';
import EditAppointment from './pages/EditAppointment';
import ServiceManagement from './pages/ServiceManagement'; 
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
  <AuthProvider> 
    <Router>
      <Routes>
        {/* ROTAS PÚBLICAS */} 
        <Route path="/" element={
        token ? ( <Home />) : (<Navigate to="/login" replace /> )} />   
        <Route path="/login" element={<Login onLogin={(token) => { localStorage.setItem('token', token); setToken(token); }} />} />
        <Route path="/register" element={<Register />} />
       {/* ROTAS COM LAYOUT */}
       
          <Route path="/agendar" element={
            <Layout>
              <PrivateRoute>
                <NewAppointment />
              </PrivateRoute>
            </Layout>
          } />
          
          <Route path="/agendamentos/pendentes" element={
            <Layout>
              <PrivateRoute>
                <PendingAppointments />
              </PrivateRoute>
            </Layout>
          } />
          
          <Route path="/agendamentos/concluidos" element={
            <Layout>
              <PrivateRoute>
                <CompletedAppointments />
              </PrivateRoute>
            </Layout>
          } />
          
          <Route path="/agendamentos/editar/:id" element={
            <Layout>
              <PrivateRoute>
                <EditAppointment />
              </PrivateRoute>
            </Layout>
          } />
          
          <Route path="/admin/servicos" element={
            <Layout>
              <PrivateRoute requiredRole="admin">
                <ServiceManagement />
              </PrivateRoute>
            </Layout>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
