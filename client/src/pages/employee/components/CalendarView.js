// client/src/pages/employee/components/CalendarView.js - VERSÃO CORRIGIDA
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { 
  Modal, 
  Button, 
  Badge, 
  Spinner, 
  Alert,
  Form
} from 'react-bootstrap';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaUser, 
  FaCut,
  FaSync,
  FaPhone,
  FaMoneyBill,
  FaCheck,
  FaBan
} from 'react-icons/fa';
import axios from 'axios';
import './CalendarView.css';

const CalendarView = ({ refreshTrigger }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  const currentDateRangeRef = useRef(null);
  const isMountedRef = useRef(true);

  // ✅ FUNÇÃO SIMPLES PARA ABREVIAR SERVIÇO
  const getServiceAbbreviation = (serviceName) => {
    if (!serviceName) return 'Serviço';
    
    // Pega só a primeira palavra
    const firstWord = serviceName.split(' ')[0];
    return firstWord.length > 8 ? firstWord.substring(0, 8) : firstWord;
  };

  const fetchAppointments = useCallback(async (start, end, forceRefresh = false) => {
    if (loading) {
      console.log('⏳ CalendarView: Busca já em andamento...');
      return;
    }

    console.log('🎯 CalendarView: Buscando...', start.toLocaleDateString(), 'até', end.toLocaleDateString());
    
    try {
      setLoading(true);
      setError('');
      
      currentDateRangeRef.current = { start, end };

      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:7777/api/agendamentos/employee/my-appointments', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          status: selectedStatus !== 'all' ? selectedStatus : undefined
        },
        timeout: 10000
      });

      if (!isMountedRef.current) return;

      const appointments = response.data || [];
      console.log('✅ CalendarView: Recebidos', appointments.length, 'agendamentos');
      
      const formattedEvents = appointments.map(appointment => {
        const startDate = new Date(appointment.date);
        const endDate = new Date(startDate.getTime() + (appointment.service?.duracao || 30) * 60000);
        
        // ✅ SERVIÇO SIMPLES
        const serviceAbbr = getServiceAbbreviation(appointment.service?.nome);
        const eventTitle = serviceAbbr;
        
        return {
          id: appointment._id,
          title: eventTitle,
          start: startDate,
          end: endDate,
          extendedProps: {
            client: appointment.client,
            service: appointment.service,
            status: appointment.status,
            notes: appointment.notes
          },
          backgroundColor: getEventColor(appointment.status),
          borderColor: getEventColor(appointment.status),
          textColor: '#ffffff'
        };
      });

      setEvents(formattedEvents);
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('❌ CalendarView: Erro:', err.message);
      setError('Erro ao carregar agendamentos.');
      setEvents([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loading, selectedStatus]);

  const getEventColor = (status) => {
    const colors = {
      'pendente': '#ffc107',
      'concluído': '#28a745',
      'cancelado': '#dc3545'
    };
    return colors[status] || '#007bff';
  };

  // ✅ FUNÇÃO CORRIGIDA: updateAppointmentStatus
  const updateAppointmentStatus = async (newStatus) => {
    if (!selectedEvent) return;
    
    try {
      setUpdatingStatus(true);
      setUpdateError('');
      
      console.log('🔧 Atualizando status para:', newStatus);
      
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:7777/api/agendamentos/${selectedEvent.id}/status`, 
        { status: newStatus },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        }
      );

      console.log('✅ Status atualizado com sucesso:', response.data);

      // ✅ ATUALIZA LOCALMENTE
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === selectedEvent.id 
            ? {
                ...event,
                extendedProps: { ...event.extendedProps, status: newStatus },
                backgroundColor: getEventColor(newStatus),
                borderColor: getEventColor(newStatus)
              }
            : event
        )
      );

      // ✅ FECHA MODAL
      setShowModal(false);
      
      // ✅ ATUALIZAÇÃO MANUAL SEM LOOP
      setTimeout(() => {
        if (currentDateRangeRef.current && isMountedRef.current) {
          console.log('🔄 CalendarView: Recarregando dados após atualização');
          fetchAppointments(
            currentDateRangeRef.current.start, 
            currentDateRangeRef.current.end, 
            true
          );
        }
      }, 1000);

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      console.error('❌ Response data:', err.response?.data);
      setUpdateError(err.response?.data?.mensagem || 'Erro ao atualizar agendamento');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    fetchAppointments(start, end);
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0 && currentDateRangeRef.current) {
      fetchAppointments(
        currentDateRangeRef.current.start, 
        currentDateRangeRef.current.end, 
        true
      );
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (currentDateRangeRef.current) {
      fetchAppointments(
        currentDateRangeRef.current.start, 
        currentDateRangeRef.current.end, 
        true
      );
    }
  }, [selectedStatus]);

  const handleDatesSet = useCallback((dateInfo) => {
    fetchAppointments(dateInfo.start, dateInfo.end);
  }, [fetchAppointments]);

  const handleEventClick = (clickInfo) => {
    console.log('🔍 Evento clicado:', clickInfo.event);
    
    const eventData = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      ...clickInfo.event.extendedProps
    };
    
    console.log('📋 Dados do evento:', eventData);
    setSelectedEvent(eventData);
    setShowModal(true);
  };

  const handleRefresh = () => {
    if (currentDateRangeRef.current) {
      fetchAppointments(
        currentDateRangeRef.current.start, 
        currentDateRangeRef.current.end, 
        true
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendente': { variant: 'warning', text: 'Pendente', icon: <FaClock /> },
      'concluído': { variant: 'secondary', text: 'Concluído', icon: <FaCheckCircle /> },
      'cancelado': { variant: 'danger', text: 'Cancelado', icon: <FaTimesCircle /> }
    };
    
    const config = statusConfig[status] || statusConfig.pendente;
    return (
      <Badge bg={config.variant} className="status-badge">
        {config.icon} {config.text}
      </Badge>
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  console.log('🔄 CalendarView RENDER - loading:', loading, 'events:', events.length);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h4>📅 Calendário de Agendamentos</h4>
        <div className="calendar-controls">
          <Form.Select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '200px' }}
            disabled={loading}
          >
            <option value="all">Todos os Status</option>
            <option value="pendente">Pendentes</option>
            <option value="concluído">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </Form.Select>
          <Button variant="outline-light" size="sm" onClick={handleRefresh} disabled={loading}>
            <FaSync className={loading ? 'fa-spin' : ''} />
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="calendar-wrapper">
        {loading && (
          <div className="loading-overlay">
            <Spinner animation="border" variant="gold" size="sm" />
            <span className="ms-2">Carregando agendamentos...</span>
          </div>
        )}
        
        <div className="fullcalendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={events}
            eventClick={handleEventClick} 
            datesSet={handleDatesSet}
            locale={ptBrLocale}
            height="auto"
            nowIndicator={true}
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>
      </div>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="appointment-modal"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>
            <FaUser className="me-2" />
            Detalhes do Agendamento
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="bg-dark text-light">
          {selectedEvent && (
            <div className="appointment-details">
              <div className="detail-section">
                <h6 className="text-gold">
                  <FaUser className="me-2" />
                  Informações do Cliente
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Nome:</strong> {selectedEvent.client?.nome || 'Não informado'}</p>
                    <p><strong>Email:</strong> {selectedEvent.client?.email || 'Não informado'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Telefone:</strong> {selectedEvent.client?.telefone || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h6 className="text-gold">
                  <FaCut className="me-2" />
                  Serviço
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Serviço:</strong> {selectedEvent.service?.nome || 'Não informado'}</p>
                    <p><strong>Duração:</strong> {selectedEvent.service?.duracao || 30} minutos</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Preço:</strong> <FaMoneyBill className="me-1" /> {formatCurrency(selectedEvent.service?.preco)}</p>
                    <p><strong>Categoria:</strong> {selectedEvent.service?.categoria || 'Geral'}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h6 className="text-gold">
                  <FaClock className="me-2" />
                  Horário do Agendamento
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Data:</strong> {selectedEvent.start.toLocaleDateString('pt-BR')}</p>
                    <p><strong>Início:</strong> {selectedEvent.start.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', minute: '2-digit' 
                    })}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Término:</strong> {selectedEvent.end.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', minute: '2-digit' 
                    })}</p>
                    <p><strong>Duração Total:</strong> {Math.round((selectedEvent.end - selectedEvent.start) / 60000)} minutos</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h6 className="text-gold">
                  <FaCheckCircle className="me-2" />
                  Status do Agendamento
                </h6>
                <div className="mb-3">
                  {getStatusBadge(selectedEvent.status)}
                </div>
                
                {selectedEvent.notes && (
                  <div className="notes-section">
                    <p><strong>📝 Observações:</strong></p>
                    <p className="notes-text">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        
       <Modal.Footer className="bg-dark">
  {updateError && (
    <Alert variant="danger" className="w-100 mb-2">
      {updateError}
    </Alert>
  )}
  
  <Button 
    variant="outline-light" 
    onClick={() => setShowModal(false)}
    disabled={updatingStatus}
  >
    Fechar
  </Button>
  
  {/* ✅ BOTÕES SIMPLES: APENAS CONCLUIR E CANCELAR */}
  {selectedEvent?.status === 'pendente' && (
    <>
      <Button 
        variant="success" 
        onClick={() => updateAppointmentStatus('concluído')}
        disabled={updatingStatus}
      >
        {updatingStatus ? (
          <>
            <Spinner animation="border" size="sm" className="me-1" />
            Atualizando...
          </>
        ) : (
          <>
            <FaCheck className="me-1" />
            Marcar como Concluído
          </>
        )}
      </Button>
      
      <Button 
        variant="outline-danger" 
        onClick={() => updateAppointmentStatus('cancelado')}
        disabled={updatingStatus}
      >
        <FaBan className="me-1" />
        Cancelar
      </Button>
    </>
  )}
  
  {/* ✅ REABRIR SE ESTIVER CANCELADO */}
  {selectedEvent?.status === 'cancelado' && (
    <Button 
      variant="warning" 
      onClick={() => updateAppointmentStatus('pendente')}
      disabled={updatingStatus}
    >
      <FaClock className="me-1" />
      Reabrir Agendamento
    </Button>
  )}
</Modal.Footer>
      </Modal>
    </div>
  );
};

export default CalendarView;