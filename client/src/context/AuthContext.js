import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('🔄 AuthContext: Buscando dados do usuário...');
          const response = await fetch('http://localhost:7777/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('✅ AuthContext: Usuário carregado', userData.tipo);
            setUser(userData);
          } else {
            console.log('❌ AuthContext: Token inválido, limpando...');
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ AuthContext: Erro ao buscar usuário:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('🔐 AuthContext: Nenhum token encontrado');
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const login = (userData, token) => {
    console.log('✅ AuthContext: Login executado', userData.tipo);
    setUser(userData);
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logout executado');
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    isAdmin: user?.tipo === 'admin',
    isFuncionario: user?.tipo === 'funcionario', 
    isCliente: user?.tipo === 'cliente',
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};