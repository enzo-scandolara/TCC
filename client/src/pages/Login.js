import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import Footer from '../components/Footer.js';
import styles from './Login.module.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:7777/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.mensagem || 'Erro no login');
        setIsLoading(false);
        return;
      }

      // ✅ 1. SALVAR TOKEN PRIMEIRO (de forma síncrona)
      localStorage.setItem('token', data.token);
      console.log('🔐 Token salvo no login:', data.token.substring(0, 50) + '...');

      // ✅ 2. BUSCAR DADOS DO USUÁRIO COM O TOKEN
      const userResponse = await fetch('http://localhost:7777/api/users/me', {
        headers: { 
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('👤 Dados do usuário:', userData);
        
        // ✅ 3. ATUALIZAR CONTEXTO DE AUTENTICAÇÃO
        login(userData, data.token);
        
        // ✅ 4. CHAMAR onLogin SE EXISTIR
        if (onLogin) {
          onLogin(data.token, userData);
        }
        
        // ✅ 5. REDIRECIONAMENTO BASEADO NO TIPO DE USUÁRIO
        if (userData.tipo === 'funcionario') {
          navigate('/employee/dashboard');
        } else if (userData.tipo === 'admin') {
          navigate('/admin/servicos');
        } else {
          navigate('/home');
        }
      } else {
        const errorData = await userResponse.json();
        console.error('❌ Erro no /me:', errorData);
        setMensagem('Erro ao carregar dados do usuário');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('💥 Erro no login:', error);
      setMensagem('Erro na conexão com o servidor');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.loginContainer}>
        <div 
          className={styles.loginBackground}
          style={{ backgroundImage: "url('/images/salao.jpg')" }}
        >
          <div className={styles.loginOverlay}></div>
          
          <div className={`d-flex align-items-center justify-content-center ${styles.loginContent}`}>
            <div className="container">
              <div className="row justify-content-center align-items-center">
                <div className="col-md-5 col-lg-4">
                  <div className={styles.loginCard}>
                    <div className={styles.loginHeader}>
                      <h2 className={styles.loginTitle}>Bem-vindo</h2>
                      <p className={styles.loginSubtitle}>Faça login em sua conta</p>
                    </div>

                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                      {mensagem && (
                        <div className="alert alert-danger" role="alert">
                          {mensagem}
                        </div>
                      )}

                      <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.formLabel}>
                          E-mail
                        </label>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          className={styles.formInput}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="seu@email.com"
                          required 
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.formLabel}>
                          Senha
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          className={styles.formInput}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua senha"
                          required 
                        />
                      </div>

                      <button
                        type="submit"
                        className={styles.loginBtn}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Entrando...
                          </>
                        ) : (
                          'Entrar'
                        )}
                      </button>

                      <div className={styles.loginDivider}>
                        <span>ou</span>
                      </div>

                      <a href="/register" className={styles.registerBtn}>
                        Criar uma conta
                      </a>

                      <div className={styles.loginLinks}>
                        <a href="/forgot-password" className={styles.forgotLink}>
                          Esqueceu sua senha?
                        </a>
                      </div>
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