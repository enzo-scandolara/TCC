import { useState } from 'react';
import Footer from '../components/Footer';
import styles from './Register.module.css';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:7777/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.message || 'Erro ao registrar');
        setIsLoading(false);
        return;
      }

      setMensagem('Usuário registrado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setIsLoading(false);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.registerContainer}>
        <div 
          className={styles.registerBackground}
          style={{ 
            backgroundImage: "url('/images/salao.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className={styles.registerOverlay}></div>
          
          <div className={`d-flex align-items-center justify-content-center ${styles.registerContent}`}>
            <div className="container">
              <div className="row justify-content-center align-items-center">
                <div className="col-md-5 col-lg-4">
                  <div className={styles.registerCard}>
                    <div className={styles.registerHeader}>
                      <h2 className={styles.registerTitle}>Criar Conta</h2>
                      <p className={styles.registerSubtitle}>Preencha seus dados para se registrar</p>
                    </div>

                    <form className={styles.registerForm} onSubmit={handleRegister}>
                      {mensagem && (
                        <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-danger'}`} role="alert">
                          {mensagem}
                        </div>
                      )}

                      <div className={styles.formGroup}>
                        <label htmlFor="nome" className={styles.formLabel}>
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          name="nome"
                          id="nome"
                          className={styles.formInput}
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Seu nome completo"
                          required 
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                          E-mail
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className={styles.formInput}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          required 
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="senha" className={styles.formLabel}>
                          Senha
                        </label>
                        <input
                          type="password"
                          name="senha"
                          id="senha"
                          className={styles.formInput}
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          placeholder="Sua senha"
                          required 
                        />
                      </div>

                      <button
                        type="submit"
                        className={styles.registerBtn}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Registrando...
                          </>
                        ) : (
                          'Registrar'
                        )}
                      </button>

                      <div className={styles.registerDivider}>
                        <span>ou</span>
                      </div>

                      <a href="/login" className={styles.loginBtn}>
                        Voltar para Login
                      </a>
                    </form>
                  </div>
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