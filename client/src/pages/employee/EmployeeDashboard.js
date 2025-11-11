// client/src/pages/employee/EmployeeDashboard.js
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import CalendarView from './components/CalendarView';
import ScheduleStatus from './components/ScheduleStatus';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

      {/* ✅ SEM onUpdate - evita loops */}
      <ScheduleStatus refreshTrigger={refreshTrigger} />
      <CalendarView refreshTrigger={refreshTrigger} />
    </Container>
  );
};

export default EmployeeDashboard;