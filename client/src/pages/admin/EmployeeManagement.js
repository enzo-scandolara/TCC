/* eslint-disable no-unused-vars */
// src/pages/Admin/EmployeeManagement.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const { user } = useAuth();

  // Estado para o formulário de novo funcionário
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: '',
    email: '',
    senha: '',
    especializacoes: [],
    horarioTrabalho: { inicio: '08:00', fim: '20:00' },
    horarioAlmoco: '12:00',
    fimHorarioAlmoco: '13:00'
  });

  // Buscar funcionários
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:7777/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    }
  };

const handleToggleStatus = async (employeeId, currentStatus, employeeNome) => {
  const acao = currentStatus ? 'desativar' : 'ativar';
  const confirmMessage = currentStatus 
    ? `Tem certeza que deseja DESATIVAR o funcionário ${employeeNome}?\n\nEle não aparecerá mais para agendamentos.`
    : `Tem certeza que deseja ATIVAR o funcionário ${employeeNome}?\n\nEle voltará a aparecer para agendamentos.`;

  if (!window.confirm(confirmMessage)) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:7777/api/employees/${employeeId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ativo: !currentStatus })
    });

    const data = await response.json();

    if (response.ok) {
      setMensagem(`Funcionário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      fetchEmployees(); // Recarregar lista
    } else {
      setMensagem(data.mensagem || 'Erro ao atualizar status');
    }
  } catch (error) {
    setMensagem('Erro na conexão com o servidor');
  }
};
  // Criar novo funcionário
  const handleCriarFuncionario = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:7777/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoFuncionario)
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Funcionário criado com sucesso!');
        setNovoFuncionario({
          nome: '',
          email: '',
          senha: '',
          especializacoes: [],
          horarioTrabalho: { inicio: '08:00', fim: '20:00' },
          horarioAlmoco: '12:00',
          fimHorarioAlmoco: '13:00'
        });
        fetchEmployees(); // Recarregar lista
      } else {
        setMensagem(data.mensagem || 'Erro ao criar funcionário');
      }
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Gestão de Funcionários
              </h4>
            </div>
            <div className="card-body">
              {/* Formulário de criação */}
              <div className="mb-4">
                <h5>Adicionar Novo Funcionário</h5>
                <form onSubmit={handleCriarFuncionario}>
                  <div className="row">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome"
                        value={novoFuncionario.nome}
                        onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={novoFuncionario.email}
                        onChange={(e) => setNovoFuncionario({...novoFuncionario, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Senha"
                        value={novoFuncionario.senha}
                        onChange={(e) => setNovoFuncionario({...novoFuncionario, senha: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Criando...' : 'Criar Funcionário'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de funcionários */}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Especializações</th>
                      <th>Horário de Trabalho</th>
                      <th>Horário de Almoço</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee._id}>
                        <td>{employee.nome}</td>
                        <td>{employee.email}</td>
                        <td>
                          {employee.especializacoes?.join(', ') || 'Nenhuma'}
                        </td>
                        <td>
                          {employee.horarioTrabalho?.inicio} - {employee.horarioTrabalho?.fim}
                        </td>
                        <td>
                          {employee.horarioAlmoco} - {employee.fimHorarioAlmoco}
                        </td>
                        <td>
                          <span className={`badge ${employee.ativo ? 'bg-success' : 'bg-secondary'}`}>
                            {employee.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
  <button 
  className={`btn btn-sm ${employee.ativo ? 'btn-outline-warning' : 'btn-outline-success'}`}
  onClick={() => handleToggleStatus(employee._id, employee.ativo, employee.nome)}
>
  <i className={`bi ${employee.ativo ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
  {employee.ativo ? ' Desativar' : ' Ativar'}
</button>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;