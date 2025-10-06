import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 30,
    preco: '',
    categoria: 'Corte'
  });
  const { isAdmin } = useAuth();

  // Função para cores das categorias
  const getCategoryBadge = (categoria) => {
    const colors = {
      'Corte': 'bg-primary',
      'Barba': 'bg-success', 
      'Sobrancelha': 'bg-warning text-dark',
      'Combo': 'bg-info',
      'Outros': 'bg-secondary'
    };
    return colors[categoria] || 'bg-secondary';
  };

  // Buscar serviços
  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:7777/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  // Criar/editar serviço
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const url = editingService 
        ? `http://localhost:7777/api/services/${editingService._id}`
        : 'http://localhost:7777/api/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchServices();
        resetForm();
      } else {
        alert('Erro ao salvar serviço');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar serviço');
    }
  };

  // Deletar serviço
  const handleDelete = async (serviceId) => {
    if (!window.confirm('Tem certeza que deseja desativar este serviço?\n\nClientes não poderão mais agendá-lo.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:7777/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      duracao: 30,
      preco: '',
      categoria: 'Corte'
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setFormData({
      nome: service.nome,
      descricao: service.descricao || '',
      duracao: service.duracao,
      preco: service.preco,
      categoria: service.categoria
    });
    setEditingService(service);
    setShowForm(true);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (!isAdmin) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          <i className="bi bi-shield-exclamation me-2"></i>
          Acesso restrito a administradores
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* ✅ CARD PRINCIPAL COM FUNDO BRANCO */}
      <div className="card shadow-sm bg-white border-0">
        <div className="card-body p-4">
          
          {/* Cabeçalho Melhorado */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1 text-dark">
                <i className="bi bi-scissors me-2"></i>
                Gerenciar Serviços
              </h2>
              <p className="text-muted mb-0">Cadastre e gerencie os serviços da barbearia</p>
            </div>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Novo Serviço
            </button>
          </div>

          {/* Formulário Estilizado */}
          {showForm && (
            <div className="card shadow-sm border mb-4">
              <div className="card-header bg-dark text-white py-3">
                <h5 className="mb-0">
                  <i className={`bi ${editingService ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                  {editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-tag me-1"></i>
                          Nome do Serviço *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          required
                          placeholder="Ex: Corte Social, Barba Tradicional..."
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-grid me-1"></i>
                          Categoria *
                        </label>
                        <select
                          className="form-select"
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          required
                        >
                          <option value="Corte">Corte</option>
                          <option value="Barba">Barba</option>
                          <option value="Sobrancelha">Sobrancelha</option>
                          <option value="Combo">Combo</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="bi bi-text-paragraph me-1"></i>
                      Descrição
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Descreva o serviço (opcional)..."
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-clock me-1"></i>
                          Duração (minutos) *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="15"
                          max="240"
                          step="15"
                          value={formData.duracao}
                          onChange={(e) => setFormData({...formData, duracao: parseInt(e.target.value)})}
                          required
                        />
                        <div className="form-text">Duração em minutos (15-240)</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-currency-dollar me-1"></i>
                          Preço (R$) *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={formData.preco}
                          onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value)})}
                          required
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      <i className={`bi ${editingService ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                      {editingService ? 'Atualizar Serviço' : 'Criar Serviço'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                      <i className="bi bi-x-lg me-2"></i>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de Serviços Estilizada */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light py-3">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Serviços Cadastrados
                <span className="badge bg-secondary ms-2">{services.length}</span>
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-2 text-muted">Carregando serviços...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-scissors display-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">Nenhum serviço cadastrado</h4>
                  <p className="text-muted mb-4">Comece cadastrando o primeiro serviço da barbearia</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Cadastrar Primeiro Serviço
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Serviço</th>
                        <th>Categoria</th>
                        <th>Duração</th>
                        <th>Preço</th>
                        <th width="120">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(service => (
                        <tr key={service._id} className={!service.ativo ? 'table-secondary' : ''}>
                          <td>
                            <div>
                              <strong>{service.nome}</strong>
                              {!service.ativo && (
                                <span className="badge bg-warning ms-2">Inativo</span>
                              )}
                              {service.descricao && (
                                <small className="d-block text-muted mt-1">
                                  <i className="bi bi-text-paragraph me-1"></i>
                                  {service.descricao}
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getCategoryBadge(service.categoria)}`}>
                              {service.categoria}
                            </span>
                          </td>
                          <td>
                            <span className="text-nowrap">
                              <i className="bi bi-clock me-1 text-muted"></i>
                              {service.duracao} min
                            </span>
                          </td>
                          <td>
                            <strong className="text-success">
                              R$ {service.preco}
                            </strong>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(service)}
                                title="Editar serviço"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(service._id)}
                                title="Desativar serviço"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

export default ServiceManagement;