import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buscar os agendamentos
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
      setMensagem('Agendamento excluído com sucesso!');
    } catch (error) {
      setMensagem('Erro ao excluir agendamento');
    }
  };

  // Função para editar
  const handleEdit = (id) => {
    navigate(`/agendamentos/editar/${id}`);
  };

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Agendamentos Pendentes
              </h4>
            </div>
            <div className="card-body">
              {mensagem && (
                <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                  <i className={`bi ${mensagem.includes('sucesso') ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {mensagem}
                </div>
              )}

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-2 text-muted">Carregando agendamentos...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x display-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">Nenhum agendamento pendente</h5>
                  <p className="text-muted">Quando você fizer agendamentos, eles aparecerão aqui.</p>
                  <Link to="/agendar" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Fazer Primeiro Agendamento
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Serviço</th>
                        <th>Data e Hora</th>
                        <th>Observações</th>
                        <th width="150">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id}>
                          <td>
                            <strong>{appt.service?.nome || appt.service}</strong>
                          </td>
                          <td>
                            <i className="bi bi-calendar-event me-1 text-muted"></i>
                            {formatDate(appt.date)}
                          </td>
                          <td>
                            {appt.observacoes || appt.notes ? (
                              <small className="text-muted">
                                <i className="bi bi-chat-text me-1"></i>
                                {appt.observacoes || appt.notes}
                              </small>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(appt._id)}
                                title="Editar agendamento"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(appt._id)}
                                title="Excluir agendamento"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="d-flex justify-content-between mt-4">
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Voltar para Home
                </Link>
                <Link to="/agendar" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Novo Agendamento
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}