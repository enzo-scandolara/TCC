
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userTipo = decoded.tipo;
    next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
};

// Só administradores
const somenteAdmin = (req, res, next) => {
  if (req.userTipo !== 'admin') {
    return res.status(403).json({ 
      mensagem: 'Acesso negado. Somente administradores.' 
    });
  }
  next();
};

// Administradores ou funcionários
const funcionarioOuAdmin = (req, res, next) => {
  if (req.userTipo !== 'admin' && req.userTipo !== 'funcionario') {
    return res.status(403).json({ 
      mensagem: 'Acesso negado. Área restrita.' 
    });
  }
  next();
};

// Só clientes
const somenteCliente = (req, res, next) => {
  if (req.userTipo !== 'cliente') {
    return res.status(403).json({ 
      mensagem: 'Acesso negado. Área somente para clientes.' 
    });
  }
  next();
};


module.exports = {
  authMiddleware,      
  somenteAdmin,        
  funcionarioOuAdmin,    
  somenteCliente       
};