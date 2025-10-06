import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NewAppointment = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const { user } = useAuth();

  // Buscar serviços disponíveis
  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:7777/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  // Buscar funcionários disponíveis
  const fetchFuncionarios = async () => {
    // Implementaremos depois na Fase 3
    return [
      { _id: '1', nome: 'João Silva' },
      { _id: '2', nome: 'Pedro Santos' }
    ];
  };

  // Gerar horários disponíveis (simulação)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    if (!selectedService || !selectedDate || !selectedTime) {
      setMensagem('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const selectedServiceData = services.find(s => s._id === selectedService);

    try {
      const response = await fetch('http://localhost:7777/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: selectedService,
          client: user._id,
          barbeiro: '1', // Temporário - implementaremos seleção na Fase 3
          date: `${selectedDate}T${selectedTime}:00.000Z`,
          notes: `Serviço: ${selectedServiceData.nome}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Agendamento criado com sucesso!');
        // Limpar formulário
        setSelectedService('');
        setSelectedDate('');
        setSelectedTime('');
      } else {
        setMensagem(data.mensagem || 'Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedServiceData = () => {
    return services.find(s => s._id === selectedService);
  };

  useEffect(() => {
    fetchServices();
  }, []);

 return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-calendar-plus me-2"></i>
                Novo Agendamento
              </h4>
            </div>
            <div className="card-body">
              {mensagem && (
                <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                  <i className={`bi ${mensagem.includes('sucesso') ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {mensagem}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Seleção de Serviço */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Serviço *</label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.nome} - {service.duracao}min - R$ {service.preco}
                      </option>
                    ))}
                  </select>
                  {selectedService && (
                    <div className="mt-2 p-3 bg-light rounded">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        <strong>Duração:</strong> {getSelectedServiceData()?.duracao} minutos | 
                        <i className="bi bi-currency-dollar ms-2 me-1"></i>
                        <strong>Preço:</strong> R$ {getSelectedServiceData()?.preco}
                      </small>
                    </div>
                  )}
                </div>

                {/* Data e Horário */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Data *</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Horário *</label>
                    <select
                      className="form-select form-control-lg"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                    >
                      <option value="">Selecione um horário</option>
                      {generateTimeSlots().map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resumo */}
                {selectedService && selectedDate && selectedTime && (
                  <div className="alert alert-info border-0">
                    <h6 className="fw-bold">
                      <i className="bi bi-card-checklist me-2"></i>
                      Resumo do Agendamento
                    </h6>
                    <div className="row mt-2">
                      <div className="col-6">
                        <strong>Serviço:</strong><br/>
                        <strong>Duração:</strong><br/>
                        <strong>Preço:</strong><br/>
                        <strong>Data:</strong>
                      </div>
                      <div className="col-6">
                        {getSelectedServiceData()?.nome}<br/>
                        {getSelectedServiceData()?.duracao} minutos<br/>
                        R$ {getSelectedServiceData()?.preco}<br/>
                        {selectedDate} às {selectedTime}
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Agendando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Confirmar Agendamento
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAppointment;