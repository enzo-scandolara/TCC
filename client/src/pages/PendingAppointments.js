import { useState, useEffect } from 'react';
//import { useAuth } from '../context/AuthContext';
import { formatAppointmentDate, isToday } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const PendingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  //const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:7777/api/agendamentos?status=pendente', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        setMensagem('Erro ao buscar agendamentos');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CANCELAR AGENDAMENTO
  const handleCancel = async (appointmentId, serviceName, date) => {
    const formattedDate = formatAppointmentDate(date).full;
    
    const confirmMessage = `Tem certeza que deseja cancelar este agendamento?\n\n` +
                          `Serviço: ${serviceName}\n` +
                          `Data: ${formattedDate}\n\n` +
                          `Você poderá fazer um novo agendamento.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:7777/api/agendamentos/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'cancelado'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Agendamento cancelado com sucesso! Você pode fazer um novo agendamento.');
        fetchAppointments();
      } else {
        setMensagem(data.mensagem || 'Erro ao cancelar agendamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('Erro na conexão com o servidor');
    }
  };

  // ✅ FAZER NOVO AGENDAMENTO
  const handleNewAppointment = () => {
    navigate('/agendar');
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
            <div className="card-header bg-warning text-dark">
              <h4 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Meus Agendamentos
              </h4>
            </div>
            <div className="card-body">
              {mensagem && (
                <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-warning'} alert-dismissible fade show`}>
                  <i className={`bi ${mensagem.includes('sucesso') ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {mensagem}
                  {mensagem.includes('sucesso') && (
                    <div className="mt-2">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={handleNewAppointment}
                      >
                        <i className="bi bi-calendar-plus me-1"></i>
                        Fazer Novo Agendamento
                      </button>
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMensagem('')}
                  ></button>
                </div>
              )}

              {appointments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x display-1 text-muted"></i>
                  <h5 className="mt-3">Nenhum agendamento</h5>
                  <p className="text-muted">Você não possui agendamentos pendentes.</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleNewAppointment}
                  >
                    <i className="bi bi-calendar-plus me-2"></i>
                    Fazer Primeiro Agendamento
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Data e Horário</th>
                        <th>Serviço</th>
                        <th>Barbeiro</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appointment => {
                        const formattedDate = formatAppointmentDate(appointment.date);
                        
                        return (
                          <tr key={appointment._id}>
                            <td>
                              <strong>{formattedDate.full}</strong>
                              {isToday(appointment.date) && (
                                <span className="badge bg-info ms-2">Hoje</span>
                              )}
                            </td>
                            <td>
                              <strong>{appointment.service.nome}</strong>
                              <br />
                              <small className="text-muted">
                                {appointment.service.duracao} minutos
                              </small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle me-2 text-primary"></i>
                                {appointment.barber.nome}
                              </div>
                            </td>
                            <td>
                              <strong className="text-success">
                                R$ {appointment.service.preco}
                              </strong>
                            </td>
                            <td>
                              <span className="badge bg-warning">Agendado</span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleCancel(
                                  appointment._id, 
                                  appointment.service.nome,
                                  appointment.date
                                )}
                                title="Cancelar Agendamento"
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Cancelar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingAppointments;