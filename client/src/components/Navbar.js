import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import styles from './Navbar.module.css';


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
              to="/agendamentos/concluidos"
              className={({ isActive }) => 
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              <i className={`bi bi-check-circle ${styles.icon}`}></i>
              Concluídos
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;