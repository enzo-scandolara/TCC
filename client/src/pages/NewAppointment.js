import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer.js';

export default function NewAppointment() {
  const [servico, setServico] = useState('');
  const [data, setData] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate();

  const handleAgendar = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:7777/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: servico,
          date: data,
          notes: observacoes,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        return setMensagem(resData.message || 'Erro ao agendar');
      }

      // Mensagem opcional (pode remover se quiser redirecionar direto)
      setMensagem('Agendamento realizado com sucesso!');

      // Limpa os campos
      setServico('');
      setData('');
      setObservacoes('');

      // Redireciona para a tela de agendamentos pendentes
      navigate('/agendamentos/pendentes');

    } catch (err) {
      console.error(err);
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
        <h2 className="text-center text-primary mb-4">Agendar novo horário</h2>

        {mensagem && (
          <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleAgendar}>
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
            Agendar
          </button>
        </form>

        <Link to="/" className="btn btn-secondary mt-4 w-100">
          Voltar
        </Link>

      </div>
    </div>
    <Footer />
    </>
  
  );
  
}
