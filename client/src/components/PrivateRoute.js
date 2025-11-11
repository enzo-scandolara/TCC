import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-gold" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (requiredRole && user.tipo !== requiredRole) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Acesso Negado</h4>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;