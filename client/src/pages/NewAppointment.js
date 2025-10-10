import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BarberSelector from '../components/BarberSelector';
import { createDateTimeString, getMinDate } from '../utils/dateUtils'; // ← IMPORTAR

const NewAppointment = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    // VALIDAÇÕES
    if (!selectedService || !selectedDate || !selectedBarber || !selectedTime) {
      setMensagem('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const selectedServiceData = services.find(s => s._id === selectedService);

    try {
      // ✅ USAR A FUNÇÃO UTILITÁRIA
      const dateTimeString = createDateTimeString(selectedDate, selectedTime);
      
      const response = await fetch('http://localhost:7777/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: selectedService,
          client: user._id,
          barber: selectedBarber,
          date: dateTimeString,
          notes: `Serviço: ${selectedServiceData.nome}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Agendamento criado com sucesso!');
        // Limpar formulário
        setSelectedService('');
        setSelectedDate('');
        setSelectedBarber('');
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

  // Resetar seleções quando mudar serviço ou data
  useEffect(() => {
    setSelectedBarber('');
    setSelectedTime('');
  }, [selectedService, selectedDate]);

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
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

                {/* Data */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Data *</label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()} // ✅ USAR FUNÇÃO UTILITÁRIA
                      required
                    />
                  </div>
                </div>

                {/* Seleção de Barbeiro e Horário */}
                <BarberSelector
                  selectedDate={selectedDate}
                  selectedService={selectedService}
                  onBarberSelect={setSelectedBarber}
                  onTimeSelect={setSelectedTime}
                />

                {/* Resumo */}
                {selectedService && selectedDate && selectedBarber && selectedTime && (
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
                        <strong>Data:</strong><br/>
                        <strong>Horário:</strong>
                      </div>
                      <div className="col-6">
                        {getSelectedServiceData()?.nome}<br/>
                        {getSelectedServiceData()?.duracao} minutos<br/>
                        R$ {getSelectedServiceData()?.preco}<br/>
                        {new Date(selectedDate).toLocaleDateString('pt-BR')}<br/>
                        {selectedTime}
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg px-4"
                    disabled={loading || !selectedBarber || !selectedTime}
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