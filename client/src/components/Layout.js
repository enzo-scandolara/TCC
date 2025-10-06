import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: "url('/images/salao.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 120px)' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;