// src/components/BarberSelector.js
import { useState, useEffect, useCallback } from 'react'; // ← ADICIONAR useCallback

const BarberSelector = ({ selectedDate, selectedTime, selectedService, onBarberSelect }) => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');

  // Usar useCallback para memoizar a função
  const fetchAvailableBarbers = useCallback(async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      setBarbers([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Buscar dados do serviço para obter duração e categoria
      const serviceResponse = await fetch(`http://localhost:7777/api/services/${selectedService}`);
      const serviceData = await serviceResponse.json();

      if (!serviceResponse.ok) {
        throw new Error('Erro ao buscar dados do serviço');
      }

      // Buscar barbeiros disponíveis
      const response = await fetch(
        `http://localhost:7777/api/employees/disponiveis?date=${selectedDate}&time=${selectedTime}&serviceDuration=${serviceData.duracao}&serviceCategory=${serviceData.categoria}`
      );

      if (response.ok) {
        const data = await response.json();
        setBarbers(data);
        
        // Auto-selecionar o primeiro barbeiro se houver apenas um
        if (data.length === 1) {
          setSelectedBarber(data[0]._id);
          onBarberSelect(data[0]._id);
        } else {
          // Limpar seleção se não há apenas um barbeiro
          setSelectedBarber('');
          onBarberSelect('');
        }
      } else {
        setError('Erro ao buscar barbeiros disponíveis');
        setBarbers([]);
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro na conexão com o servidor');
      setBarbers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedTime, selectedService, onBarberSelect]); // ← DEPENDÊNCIAS

  // Atualizar barbeiros quando data/hora/serviço mudar
  useEffect(() => {
    fetchAvailableBarbers();
  }, [fetchAvailableBarbers]); // ← AGORA CORRETO

  const handleBarberChange = (barberId) => {
    setSelectedBarber(barberId);
    onBarberSelect(barberId);
  };

  if (!selectedDate || !selectedTime || !selectedService) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Selecione data, horário e serviço para ver os barbeiros disponíveis
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label className="form-label fw-bold">Barbeiro *</label>
      
      {loading && (
        <div className="alert alert-info">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Buscando barbeiros disponíveis...
        </div>
      )}

      {error && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && barbers.length === 0 && selectedDate && selectedTime && selectedService && (
        <div className="alert alert-warning">
          <i className="bi bi-clock me-2"></i>
          Nenhum barbeiro disponível para este horário. Tente outro horário ou data.
        </div>
      )}

      {!loading && barbers.length > 0 && (
        <div className="row">
          {barbers.map(barber => (
            <div key={barber._id} className="col-md-6 mb-2">
              <div className={`card ${selectedBarber === barber._id ? 'border-primary' : ''}`}>
                <div className="card-body py-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="barber"
                      id={`barber-${barber._id}`}
                      value={barber._id}
                      checked={selectedBarber === barber._id}
                      onChange={(e) => handleBarberChange(e.target.value)}
                    />
                    <label className="form-check-label w-100" htmlFor={`barber-${barber._id}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{barber.nome}</strong>
                          {barber.especializacoes && barber.especializacoes.length > 0 && (
                            <small className="text-muted d-block">
                              Especialidades: {barber.especializacoes.join(', ')}
                            </small>
                          )}
                        </div>
                        <div className="text-end">
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Disponível
                          </small>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBarber && (
        <div className="mt-2 p-2 bg-light rounded">
          <small className="text-muted">
            <i className="bi bi-person-check me-1"></i>
            Barbeiro selecionado: <strong>{barbers.find(b => b._id === selectedBarber)?.nome}</strong>
          </small>
        </div>
      )}
    </div>
  );
};

export default BarberSelector;