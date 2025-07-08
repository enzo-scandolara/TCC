import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CompletedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:7777/api/agendamentos?status=concluido', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setMensagem('Erro ao buscar agendamentos concluídos');
          return;
        }
        

        const data = await response.json();

        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAppointments(sortedData);
      } catch (error) {
        setMensagem('Erro ao conectar com o servidor');
      }
    };

    fetchAppointments();
  }, []);

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
      <div 
        className="card shadow p-4 bg-light"
        style={{ maxWidth: '600px', width: '100%', opacity: 0.95 }}
      >
        <h2 className="text-center text-success mb-4">Agendamentos Concluídos</h2>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            Nenhum agendamento concluído.
          </div>
        ) : (
          <div 
            style={{ 
              maxHeight: '400px', 
              overflowY: 'auto', 
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem'
            }}
          >
            <ul className="list-group">
              {appointments.map((appt) => (
                <li key={appt._id} className="list-group-item">
                  <strong>Serviço:</strong> {appt.service} <br />
                  <strong>Data:</strong> {new Date(appt.date).toLocaleString()} <br />
                  {appt.notes && (
                    <>
                      <strong>Observações:</strong> {appt.notes}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link to="/" className="btn btn-secondary mt-4 w-100">
          Voltar
        </Link>
      </div>
    </div>
  );
}
