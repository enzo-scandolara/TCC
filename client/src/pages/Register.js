import { useState } from 'react';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch('http://localhost:7777/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setMensagem(data.message || 'Erro ao registrar');
      }

      setMensagem('Usuário registrado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  return (
    <div
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
              <div
                id="login-box"
                className="col-md-12 p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}
              >
                <form id="login-form" className="form" onSubmit={handleRegister}>
                  <h3 className="text-center text-dark">Registro</h3>

                  {mensagem && <p className="text-danger">{mensagem}</p>}

                  <div className="form-group">
                    <label htmlFor="nome" className="text-dark">Nome:</label><br />
                    <input
                      type="text"
                      name="nome"
                      id="nome"
                      className="form-control"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="text-dark">Email:</label><br />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="senha" className="text-dark">Senha:</label><br />
                    <input
                      type="password"
                      name="senha"
                      id="senha"
                      className="form-control"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group d-flex justify-content-between mt-4">
                    <input
                      type="submit"
                      name="submit"
                      className="btn btn-info btn-md"
                      value="Registrar"
                    />
                    <a href="/login" className="btn btn-secondary btn-md ml-3">Voltar para login</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
