// client/src/pages/employee/components/ScheduleStatus.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCalendarCheck,
  FaExclamationTriangle,
  FaCalendarWeek
} from 'react-icons/fa';
import axios from 'axios';
import './ScheduleStatus.css';

const ScheduleStatus = ({ refreshTrigger, onUpdate }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');
  
  const isMountedRef = useRef(true);
  const lastPeriodRef = useRef(period);
  const requestInProgressRef = useRef(false);
  const lastUpdateRef = useRef(0); // ✅ ANTI-LOOP

  const getPeriodDates = () => {
    const today = new Date();
    
    if (period === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { start: startOfWeek, end: endOfWeek };
    } else {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      return { start: startOfMonth, end: endOfMonth };
    }
  };

  const fetchStats = async () => {
    if (requestInProgressRef.current) {
      console.log('🚫 ScheduleStatus: Request já em andamento');
      return;
    }

    try {
      requestInProgressRef.current = true;
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Sessão não autenticada');
        return;
      }

      const { start, end } = getPeriodDates();

      console.log('📊 ScheduleStatus: Buscando', period);

      const response = await axios.get('http://localhost:7777/api/agendamentos/employee/my-appointments', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        },
        timeout: 8000
      });

      if (!isMountedRef.current) return;

      const appointments = response.data || [];
      console.log('✅ ScheduleStatus: Recebidos', appointments.length, 'agendamentos');
      
      const newStats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pendente').length,
        completed: appointments.filter(a => a.status === 'concluído').length,
        cancelled: appointments.filter(a => a.status === 'cancelado').length
      };

      console.log('📈 Stats calculados:', newStats);
      setStats(newStats);

      // ✅ ANTI-LOOP: Só notifica se realmente mudou
      if (onUpdate && lastUpdateRef.current !== refreshTrigger) {
        console.log('🔄 ScheduleStatus: Notificando atualização PONTUAL');
        lastUpdateRef.current = refreshTrigger;
      }

    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('❌ ScheduleStatus: Erro:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erro ao carregar estatísticas');
      setStats({ total: 0, pending: 0, completed: 0, cancelled: 0 });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        requestInProgressRef.current = false;
      }
    }
  };

  // ✅ useEffect CORRIGIDO
  useEffect(() => {
    isMountedRef.current = true;
    
    if (lastPeriodRef.current !== period) {
      console.log('🔄 ScheduleStatus: Período mudou para', period);
      lastPeriodRef.current = period;
      fetchStats();
    } else {
      // Primeira carga
      fetchStats();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [period]);

  // ✅ useEffect PARA REFRESH - COM ANTI-LOOP
  useEffect(() => {
    if (refreshTrigger > 0 && isMountedRef.current) {
      console.log('🔄 ScheduleStatus: Refresh trigger recebido', refreshTrigger);
      
      // ✅ Só executa se for um trigger NOVO
      if (refreshTrigger !== lastUpdateRef.current) {
        fetchStats();
      }
    }
  }, [refreshTrigger]);

  // ✅ CARDS
  const statusCards = [
    {
      title: 'Total',
      value: stats.total,
      variant: 'primary',
      icon: <FaCalendarCheck />,
      description: period === 'week' ? 'Esta semana' : 'Este mês'
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      variant: 'warning',
      icon: <FaClock />,
      description: 'Aguardando'
    },
    {
      title: 'Concluídos',
      value: stats.completed,
      variant: 'secondary',
      icon: <FaCheckCircle />,
      description: 'Finalizados'
    },
    {
      title: 'Cancelados',
      value: stats.cancelled,
      variant: 'danger',
      icon: <FaTimesCircle />,
      description: 'Cancelados'
    }
  ];

  if (loading) {
    return (
      <div className="schedule-status">
        <div className="text-center py-4">
          <Spinner animation="border" variant="gold" size="sm" />
          <p className="mt-2 text-light">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-status">
      <div className="text-center mb-4">
        <h5 className="text-gold mb-3">Estatísticas dos Agendamentos</h5>
        <div className="period-selector">
          <Button
            variant={period === 'week' ? 'gold' : 'outline-gold'}
            size="sm"
            className="me-2"
            onClick={() => setPeriod('week')}
            disabled={loading}
          >
            <FaCalendarWeek className="me-1" />
            Semana
          </Button>
          <Button
            variant={period === 'month' ? 'gold' : 'outline-gold'}
            size="sm"
            onClick={() => setPeriod('month')}
            disabled={loading}
          >
            <FaCalendarCheck className="me-1" />
            Mês
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="warning" className="mb-3 text-center">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      <Row className="g-3 justify-content-center">
        {statusCards.map((card, index) => (
          <Col key={index} xs={6} md={3} lg={2} className="mb-2">
            <Card className={`status-card status-${card.variant} h-100`}>
              <Card.Body className="text-center p-3">
                <div className="status-icon mb-2">
                  {card.icon}
                </div>
                <h4 className="status-value mb-1">{card.value}</h4>
                <h6 className="status-title mb-1">{card.title}</h6>
                <small className="status-description">{card.description}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ScheduleStatus;