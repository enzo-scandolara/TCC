import { useState, useEffect, useCallback } from 'react';

const BarberSelector = ({ selectedDate, selectedService, onBarberSelect, onTimeSelect }) => {
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // ✅ SIMPLES: Buscar horários disponíveis
  const fetchAvailableData = useCallback(async () => {
    if (!selectedDate || !selectedService) {
      setBarbers([]);
      setAvailableSlots([]);
      setSelectedBarber('');
      setSelectedTime('');
      onBarberSelect('');
      onTimeSelect('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:7777/api/agendamentos/horarios-disponiveis?date=${selectedDate}&serviceId=${selectedService}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBarbers(data.barbers || []);
        setAvailableSlots(data.availableSlots || []);
        
        // Resetar seleções
        setSelectedBarber('');
        setSelectedTime('');
        onBarberSelect('');
        onTimeSelect('');
        
      } else {
        const errorData = await response.json();
        setError(errorData.mensagem || 'Erro ao buscar horários disponíveis');
        setBarbers([]);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro na conexão com o servidor');
      setBarbers([]);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedService, onBarberSelect, onTimeSelect]);

  useEffect(() => {
    fetchAvailableData();
  }, [fetchAvailableData]);

  const handleBarberChange = (barberId) => {
    setSelectedBarber(barberId);
    setSelectedTime('');
    onBarberSelect(barberId);
    onTimeSelect('');
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    onTimeSelect(time);
  };

  // Agrupar horários disponíveis por barbeiro
  const getAvailableTimesForBarber = (barberId) => {
    return availableSlots
      .filter(slot => slot.barberId === barberId)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  if (!selectedDate || !selectedService) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Selecione data e serviço para ver os horários disponíveis
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="form-label fw-bold">Barbeiro e Horário *</label>
      
      {loading && (
        <div className="alert alert-info">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Buscando horários disponíveis...
        </div>
      )}

      {error && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && barbers.length === 0 && selectedDate && selectedService && (
        <div className="alert alert-warning">
          <i className="bi bi-clock me-2"></i>
          Nenhum barbeiro disponível para esta data. Tente outra data.
        </div>
      )}

      {!loading && barbers.length > 0 && (
        <div className="row">
          {barbers.map(barber => {
            const barberSlots = getAvailableTimesForBarber(barber._id);
            return (
              <div key={barber._id} className="col-12 mb-4">
                <div className={`card ${selectedBarber === barber._id ? 'border-primary' : 'border-light'}`}>
                  <div className="card-body">
                    {/* Cabeçalho do Barbeiro - SIMPLES */}
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="barber"
                        id={`barber-${barber._id}`}
                        value={barber._id}
                        checked={selectedBarber === barber._id}
                        onChange={(e) => handleBarberChange(e.target.value)}
                        disabled={barberSlots.length === 0}
                      />
                      <label 
                        className={`form-check-label fw-bold ${barberSlots.length === 0 ? 'text-muted' : ''}`} 
                        htmlFor={`barber-${barber._id}`}
                      >
                        {barber.nome}
                        {barber.especializacoes && barber.especializacoes.length > 0 && (
                          <small className="text-muted ms-2">
                            ({barber.especializacoes.join(', ')})
                          </small>
                        )}
                        {barberSlots.length === 0 && (
                          <small className="text-warning ms-2">
                            (Sem horários disponíveis)
                          </small>
                        )}
                      </label>
                    </div>

                    {/* Horários Disponíveis - SIMPLES */}
                    {selectedBarber === barber._id && barberSlots.length > 0 && (
                      <div className="ms-4">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-clock me-1"></i>
                          Horários Disponíveis:
                        </h6>
                        <div className="row">
                          {barberSlots.map(slot => (
                            <div key={slot.time} className="col-md-3 col-6 mb-2">
                              <button
                                type="button"
                                className={`btn w-100 ${selectedTime === slot.time ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleTimeChange(slot.time)}
                              >
                                {slot.time}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBarber && selectedTime && (
        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted">
            <i className="bi bi-person-check me-1"></i>
            <strong>Barbeiro:</strong> {barbers.find(b => b._id === selectedBarber)?.nome} | 
            <i className="bi bi-clock ms-2 me-1"></i>
            <strong>Horário:</strong> {selectedTime}
          </small>
        </div>
      )}
    </div>
  );
};

export default BarberSelector;