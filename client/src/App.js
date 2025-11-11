import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import NewAppointment from './pages/NewAppointment';
import PendingAppointments from './pages/PendingAppointments';
import CompletedAppointments from './pages/CompletedAppointments';
import ServiceManagement from './pages/admin/ServiceManagement'; 
import PrivateRoute from './components/PrivateRoute';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

export default function App() {
  return (
    <AuthProvider> 
      <Router>
        <Routes>
          {/* ROTAS PÚBLICAS */} 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ROTAS AUTENTICADAS COM LAYOUT */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/agendar" element={
            <PrivateRoute>
              <Layout>
                <NewAppointment />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/agendamentos/pendentes" element={
            <PrivateRoute>
              <Layout>
                <PendingAppointments />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/agendamentos/historico" element={
            <PrivateRoute>
              <Layout>
                <CompletedAppointments />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* ROTA DO FUNCIONÁRIO */}
          <Route path="/employee/dashboard" element={
            <PrivateRoute requiredRole="funcionario">
              <Layout>
                <EmployeeDashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* ROTAS ADMIN */}
          <Route path="/admin/servicos" element={
            <PrivateRoute requiredRole="admin">
              <Layout>
                <ServiceManagement />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/funcionarios" element={
            <PrivateRoute requiredRole="admin">
              <Layout>
                <EmployeeManagement />
              </Layout>
            </PrivateRoute>
          } />
          
          {/* REDIRECIONAMENTO PADRÃO */}
          <Route path="*" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}