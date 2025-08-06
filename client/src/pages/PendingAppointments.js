import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer.js';

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  // Buscar os agendamentos
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:7777/api/agendamentos?status=pendente', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setMensagem('Erro ao buscar agendamentos pendentes');
        return;
      }

      const data = await response.json();

      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAppointments(sortedData);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  // Função para excluir
  const handleDelete = async (id) => {
    const confirm = window.confirm('Tem certeza que deseja excluir este agendamento?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:7777/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        setMensagem(resData.message || 'Erro ao excluir agendamento');
        return;
      }

      // Atualiza lista após excluir
      setAppointments(appointments.filter((appt) => appt._id !== id));
    } catch (error) {
      setMensagem('Erro ao excluir agendamento');
    }
  };

  // Função para editar (irá navegar para uma tela de edição)
  const handleEdit = (id) => {
    navigate(`/agendamentos/editar/${id}`);
  };

  return (
    <><div
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
        style={{ maxWidth: '700px', width: '100%', opacity: 0.95 }}
      >
        <h2 className="text-center text-warning mb-4">Agendamentos Pendentes</h2>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            Nenhum agendamento pendente.
          </div>
        ) : (
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
            }}
          >
            <ul className="list-group">
              {appointments.map((appt) => (
                <li key={appt._id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>Serviço:</strong> {appt.service} <br />
                      <strong>Data:</strong> {new Date(appt.date).toLocaleString()} <br />
                      {appt.notes && (
                        <>
                          <strong>Observações:</strong> {appt.notes}
                        </>
                      )}
                    </div>
                    <div className="ms-3">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(appt._id)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(appt._id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
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
    <Footer />
    </>
  );
}
