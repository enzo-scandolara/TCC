// client/src/pages/employee/EmployeeDashboard.js - VERSÃO ATUALIZADA
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import CalendarView from './components/CalendarView';
import ScheduleStatus from './components/ScheduleStatus';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStatusUpdate = () => {
    console.log('🔄 EmployeeDashboard: Atualização solicitada');
    setRefreshTrigger(prev => prev + 1);
  };

  console.log('🔄 EmployeeDashboard Render - refreshTrigger:', refreshTrigger);

  return (
    <Container fluid className="employee-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-container">
          <h1 className="dashboard-title">
            Dashboard do Funcionário
          </h1>
          <p className="dashboard-subtitle">
            Gerencie seus agendamentos e visualize suas estatísticas
          </p>
        </div>
      </div>

      <ScheduleStatus refreshTrigger={refreshTrigger} onUpdate={handleStatusUpdate} />
      
      {/* ✅ PASSA onUpdate TAMBÉM PARA O CalendarView */}
      <CalendarView refreshTrigger={refreshTrigger} onUpdate={handleStatusUpdate} />
    </Container>
  );
};

export default EmployeeDashboard;