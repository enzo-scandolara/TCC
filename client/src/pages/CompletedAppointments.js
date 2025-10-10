import { useState, useEffect } from 'react';
//import { useAuth } from '../context/AuthContext';
import { formatAppointmentDate } from '../utils/dateUtils';

const CompletedAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  //const { user } = useAuth();

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:7777/api/agendamentos?status=concluído', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        setMensagem('Erro ao buscar histórico de agendamentos');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Histórico de Agendamentos
              </h4>
            </div>
            <div className="card-body">
              {mensagem && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {mensagem}
                </div>
              )}

              {appointments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-check display-1 text-muted"></i>
                  <h5 className="mt-3">Nenhum agendamento concluído</h5>
                  <p className="text-muted">Seu histórico de agendamentos aparecerá aqui.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Data e Horário</th>
                        <th>Serviço</th>
                        <th>Barbeiro</th>
                        <th>Status</th>
                        <th>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appointment => {
                        const formattedDate = formatAppointmentDate(appointment.date);
                        
                        return (
                          <tr key={appointment._id}>
                            <td>
                              <strong>{formattedDate.full}</strong>
                            </td>
                            <td>
                              <strong>{appointment.service.nome}</strong>
                              <br />
                              <small className="text-muted">
                                {appointment.service.duracao} min • R$ {appointment.service.preco}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle me-2 text-primary"></i>
                                {appointment.barber.nome}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Concluído
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {appointment.notes || 'Nenhuma observação'}
                              </small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Estatísticas */}
              {appointments.length > 0 && (
                <div className="mt-4 p-3 bg-light rounded">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <h4 className="text-success mb-1">{appointments.length}</h4>
                      <small className="text-muted">Total de Serviços</small>
                    </div>
                    <div className="col-md-4">
                      <h4 className="text-primary mb-1">
                        R$ {appointments.reduce((total, app) => total + app.service.preco, 0).toFixed(2)}
                      </h4>
                      <small className="text-muted">Valor Total</small>
                    </div>
                    <div className="col-md-4">
                      <h4 className="text-info mb-1">
                        {new Set(appointments.map(app => app.barber._id)).size}
                      </h4>
                      <small className="text-muted">Barbeiros Diferentes</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedAppointments;