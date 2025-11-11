import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/salao.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <main style={{ 
        flex: 1,
        padding: '20px 0'
      }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;