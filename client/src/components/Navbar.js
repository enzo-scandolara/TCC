import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAdmin, isFuncionario, isCliente, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <NavLink to="/" className={styles.brand}>
          <img 
            src="/favicon.ico"
            alt="Barbearia Pai & Filho" 
            className={styles.logo}
          />
          Barbearia Pai & Filho
        </NavLink>

        <button 
          className={styles.toggleButton}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          ☰
        </button>

        <ul className={`${styles.navList} ${menuOpen ? styles.open : ''}`}>
          {/* Links para TODOS os usuários logados */}
          <li className={styles.navItem}>
            <NavLink 
              to="/home"
              className={({ isActive }) => 
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              <i className={`bi bi-house ${styles.icon}`}></i>
              Home
            </NavLink>
          </li>

          {/* Links específicos para ADMIN */}
          {isAdmin && (
            <>
              <li className={styles.navItem}>
                <NavLink 
                  to="/admin/servicos"
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                  }
                >
                  <i className={`bi bi-scissors ${styles.icon}`}></i>
                  Gerenciar Serviços
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink 
                  to="/admin/funcionarios"
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                  }
                >
                  <i className={`bi bi-people ${styles.icon}`}></i>
                  Gerenciar Funcionários
                </NavLink>
              </li>
            </>
          )}

          {/* Links para FUNCIONÁRIOS e ADMIN */}
          {(isFuncionario || isAdmin) && (
            <li className={styles.navItem}>
              <NavLink 
                to="/agenda"
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                <i className={`bi bi-calendar-week ${styles.icon}`}></i>
                Minha Agenda
              </NavLink>
            </li>
          )}

          {/* Links para CLIENTES */}
          {isCliente && (
            <>
              <li className={styles.navItem}>
                <NavLink 
                  to="/agendar"
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                  }
                >
                  <i className={`bi bi-calendar-plus ${styles.icon}`}></i>
                  Agendar
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink 
                  to="/agendamentos/pendentes"
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                  }
                >
                  <i className={`bi bi-clock-history ${styles.icon}`}></i>
                  Pendentes
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink 
                  to="/agendamentos/historico" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                  }
                >
                  <i className={`bi bi-check-circle ${styles.icon}`}></i>
                  Histórico 
                </NavLink>
              </li>
            </>
          )}

          {/* DROPDOWN DO USUÁRIO */}
          {user && (
            <li className={styles.navItem}>
              <div className={styles.userDropdown}>
                <button 
                  className={styles.userToggle}
                  onClick={toggleUserMenu}
                >
                  <div className={styles.userAvatar}>
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>{user.nome}</span>
                  <i className={`bi bi-chevron-down ${styles.chevron} ${userMenuOpen ? styles.rotate : ''}`}></i>
                </button>
                
                {userMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.userInfo}>
                      <div className={styles.userHeader}>
                        <div className={styles.userDetails}>
                          <strong>{user.nome}</strong>
                          <small>{user.tipo}</small>
                        </div>
                      </div>
                    </div>
                    <hr className={styles.divider}/>
                    <button className={styles.menuItem}>
                      <i className={`bi bi-person ${styles.icon}`}></i>
                      Meu Perfil
                    </button>
                    <button className={styles.menuItem}>
                      <i className={`bi bi-gear ${styles.icon}`}></i>
                      Configurações
                    </button>
                    <hr className={styles.divider}/>
                    <button 
                      className={`${styles.menuItem} ${styles.logoutItem}`}
                      onClick={handleLogout}
                    >
                      <i className={`bi bi-box-arrow-right ${styles.icon}`}></i>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;