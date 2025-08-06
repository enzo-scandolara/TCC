import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Footer from '../components/Footer.js';

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [servico, setServico] = useState('');
  const [data, setData] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:7777/api/agendamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          setMensagem(data.mensagem || 'Erro ao buscar agendamento');
          return;
        }

        setServico(data.service);
        setData(new Date(data.date).toISOString().slice(0, 16));
        setObservacoes(data.notes || '');
      } catch (error) {
        setMensagem('Erro na conexão com o servidor');
      }
    };

    fetchAppointment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:7777/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: data,
          service: servico,
          notes: observacoes,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setMensagem(resData.mensagem || 'Erro ao atualizar');
        return;
      }

      navigate('/agendamentos/pendentes');
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  return (
    <><div
      style={{
        backgroundImage: "url('/images/salao.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <div className="card shadow p-4 bg-light" style={{ maxWidth: '500px', width: '100%', opacity: 0.95 }}>
        <h2 className="text-center text-primary mb-4">Editar Agendamento</h2>

        {mensagem && (
          <div className={`alert ${mensagem.includes('Erro') ? 'alert-danger' : 'alert-success'}`} role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Serviço:</label>
            <input
              type="text"
              className="form-control"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              required />
          </div>

          <div className="mb-3">
            <label className="form-label">Data e Hora:</label>
            <input
              type="datetime-local"
              className="form-control"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required />
          </div>

          <div className="mb-4">
            <label className="form-label">Observações:</label>
            <textarea
              className="form-control"
              rows="3"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Salvar Alterações
          </button>
        </form>

        <Link to="/agendamentos/pendentes" className="btn btn-secondary mt-4 w-100">
          Voltar
        </Link>
      </div>
    </div>
    <Footer />
    </>
  );
}
