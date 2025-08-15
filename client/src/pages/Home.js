import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './Home.module.css';

export default function Home() {
  return (
    <>
      <Navbar />
      
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeCard}>
          <h1 className={styles.welcomeTitle}>Bem-vindo à Barbearia Pai & Filho!</h1>
          <p className={styles.welcomeText}>
            Descubra a tradição e qualidade do nosso atendimento. 
            Agende seu horário e tenha a melhor experiência em cuidados masculinos.
          </p>
          <Link
            to="/agendar"
            className={styles.ctaButton}
          >
            <i className="bi bi-scissors"></i>Agendar Corte
          </Link>
        </div>
      </div>
      
      <Footer />
    </>
  );
}