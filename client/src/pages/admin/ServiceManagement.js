import { useState, useEffect } from 'react';
import { currencyMask, parseCurrency } from '../../utils/formatUtils'; // ← IMPORTAR

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Estado para o formulário de novo serviço
  const [novoServico, setNovoServico] = useState({
    nome: '',
    descricao: '',
    duracao: 30, //  VALOR PADRÃO 30 MINUTOS
    preco: '',
    categoria: 'Corte',
    ativo: true
  });

  //  DURAÇÕES FIXAS
  const duracaoOptions = [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '60 minutos' }
  ];

  // Categorias disponíveis
  const categoriasDisponiveis = ['Corte', 'Barba', 'Sobrancelha', 'Combo', 'Outros'];

  // ✅ MANIPULADOR DE PREÇO FORMATADO
  const handlePrecoChange = (e) => {
    const rawValue = e.target.value;
    // Aplicar máscara
    const formattedValue = currencyMask(rawValue);
    setNovoServico({...novoServico, preco: formattedValue});
  };

  // ✅ MANIPULADOR DE DURAÇÃO
  const handleDuracaoChange = (e) => {
    setNovoServico({...novoServico, duracao: parseInt(e.target.value)});
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
    }
  };

  // Criar novo serviço
  const handleCriarServico = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // ✅ CONVERTER PREÇO FORMATADO PARA NÚMERO
      const precoNumerico = parseCurrency(novoServico.preco);
      
      if (precoNumerico <= 0) {
        setMensagem('Preço deve ser maior que zero');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:7777/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...novoServico,
          preco: precoNumerico // ✅ ENVIAR NÚMERO
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Serviço criado com sucesso!');
        setNovoServico({
          nome: '',
          descricao: '',
          duracao: 30,
          preco: '',
          categoria: 'Corte',
          ativo: true
        });
        fetchServices();
      } else {
        setMensagem(data.mensagem || 'Erro ao criar serviço');
      }
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Deletar serviço (desativar)
  const handleDeletarServico = async (serviceId) => {
    if (!window.confirm('Tem certeza que deseja desativar este serviço?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:7777/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMensagem('Serviço desativado com sucesso!');
        fetchServices();
      } else {
        setMensagem('Erro ao desativar serviço');
      }
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-scissors me-2"></i>
                Gestão de Serviços
              </h4>
            </div>
            <div className="card-body">
              {mensagem && (
                <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                  <i className={`bi ${mensagem.includes('sucesso') ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {mensagem}
                </div>
              )}

              {/* Formulário de criação */}
              <div className="mb-4">
                <h5>Adicionar Novo Serviço</h5>
                <form onSubmit={handleCriarServico}>
                  <div className="row">
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome do serviço"
                        value={novoServico.nome}
                        onChange={(e) => setNovoServico({...novoServico, nome: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={novoServico.duracao}
                        onChange={handleDuracaoChange}
                        required
                      >
                        {duracaoOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Preço"
                        value={novoServico.preco}
                        onChange={handlePrecoChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={novoServico.categoria}
                        onChange={(e) => setNovoServico({...novoServico, categoria: e.target.value})}
                        required
                      >
                        {categoriasDisponiveis.map(categoria => (
                          <option key={categoria} value={categoria}>
                            {categoria}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Criando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle me-2"></i>
                            Criar Serviço
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Descrição */}
                  <div className="row mt-3">
                    <div className="col-12">
                      <textarea
                        className="form-control"
                        placeholder="Descrição do serviço (opcional)"
                        rows="2"
                        value={novoServico.descricao}
                        onChange={(e) => setNovoServico({...novoServico, descricao: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {/* Preview do preço */}
                  {novoServico.preco && (
                    <div className="row mt-2">
                      <div className="col-12">
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Preço definido: <strong>{novoServico.preco}</strong> | 
                          Duração: <strong>{novoServico.duracao} minutos</strong>
                        </small>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Lista de serviços */}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Duração</th>
                      <th>Preço</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(service => (
                      <tr key={service._id}>
                        <td>
                          <strong>{service.nome}</strong>
                        </td>
                        <td>
                          <small className="text-muted">
                            {service.descricao || 'Sem descrição'}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{service.categoria}</span>
                        </td>
                        <td>
                          <span className="badge bg-info">{service.duracao} min</span>
                        </td>
                        <td>
                          <strong className="text-success">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(service.preco)}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge ${service.ativo ? 'bg-success' : 'bg-secondary'}`}>
                            {service.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeletarServico(service._id)}
                            disabled={!service.ativo}
                          >
                            <i className="bi bi-trash"></i> Desativar
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

export default ServiceManagement;