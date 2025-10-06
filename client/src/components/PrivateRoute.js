import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, requiredRole }) {
  const { user, isAdmin, isLoading } = useAuth();
  const token = localStorage.getItem('token');

  // Mostrar loading enquanto busca dados do usuário
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // 1. Verifica se está logado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verifica se tem a role necessária (se especificada)
  if (requiredRole) {
    // Admin tem acesso a tudo
    if (!isAdmin && user?.tipo !== requiredRole) {
      return <Navigate to="/home" replace />; //  Redireciona para home em vez de unauthorized
    }
  }

  return children;
}