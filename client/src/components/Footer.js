import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '1rem 0',
      fontSize: '0.9rem',
      textAlign: 'center',
      borderTop: '1px solid #333'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div>
            Desenvolvido por:
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <a 
              href="https://github.com/enzo-scandolara" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#f8b400',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#f8b400'}
            >
              Enzo Passos Scandolara
            </a>
            <a 
              href="https://github.com/Maria-384" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#f8b400',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#f8b400'}
            >
              Maria Clara Paganini Pinto
            </a>
          </div>
          <div style={{ marginTop: '0.5rem', color: '#aaa' }}>
            &copy; {new Date().getFullYear()} Barbearia Pai & Filho - Todos os direitos reservados
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;