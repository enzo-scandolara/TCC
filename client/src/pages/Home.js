// src/pages/Home.js
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();

  return (
    // Remove <> e </> - agora só o conteúdo principal
      
    <div className={styles.heroSection}>
      <div className="container">
        <div className="row align-items-center min-vh-100">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className={styles.heroTitle}>
              Barbearia Pai & Filho
            </h1>
            <p className={styles.heroSubtitle}>
              Tradição e qualidade em cuidados masculinos
            </p>
            <p className={styles.heroDescription}>
              Agende seu horário e experimente o cuidado e precisão que só anos de experiência podem oferecer.
            </p>
            
            <div className={styles.ctaContainer}>
              <Link to="/agendar" className={styles.primaryButton}>
                <i className="bi bi-calendar-plus me-2"></i>
                Agendar Horário
              </Link>
              {!user && (
                <Link to="/login" className={styles.secondaryButton}>
                  <i className="bi bi-person me-2"></i>
                  Área do Cliente
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}