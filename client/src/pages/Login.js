import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import Footer from '../components/Footer.js';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch('http://localhost:7777/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.mensagem || 'Erro no login');
        return;
      }

      localStorage.setItem('token', data.token);
      
      // ⚠️ NOVO: Buscar dados completos do usuário
      const userResponse = await fetch('http://localhost:7777/api/users/me', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        login(userData); // PREENCHE O AUTH CONTEXT
      }
      
      onLogin(data.token);
      navigate('/home');
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
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
    >
      <div id="login" className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="container">
          <div id="login-row" className="row justify-content-center align-items-center">
            <div id="login-column" className="col-md-6">
              <div id="login-box" className="col-md-12 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
                <form id="login-form" className="form" onSubmit={handleSubmit}>
                  <h3 className="text-center text-dark">Login</h3>

                  {mensagem && <p className="text-danger">{mensagem}</p>}

                  <div className="form-group">
                    <label htmlFor="username" className="text-dark">Usuário:</label><br />
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="text-dark">Senha:</label><br />
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required />
                  </div>

                  <div className="form-group d-flex justify-content-between mt-4">
                    <input
                      type="submit"
                      name="submit"
                      className="btn btn-info btn-md"
                      value="Enviar" />
                    <a href="/register" className="btn btn-secondary btn-md ms-5">
                      Registre-se
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>

  );
}