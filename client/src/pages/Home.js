import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div 
      style={{ 
        backgroundImage: "url('/images/salao.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <div className="card shadow p-4 bg-light" style={{ maxWidth: '400px', width: '100%', opacity: 0.95 }}>
        <h1 className="card-title text-center mb-4 text-primary">Bem-vindo(a)!</h1>
        <nav>
          <ul className="list-unstyled">
            <li className="mb-3">
              <Link
                to="/agendar"
                className="btn btn-primary w-100"
              >
                Agendar um Serviço
              </Link>
            </li>
            <li className="mb-3">
              <Link
                to="/agendamentos/pendentes"
                className="btn btn-warning w-100"
              >
                Agendamentos Pendentes
              </Link>
            </li>
            <li>
              <Link
                to="/agendamentos/concluidos"
                className="btn btn-success w-100"
              >
                Agendamentos Concluídos
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
