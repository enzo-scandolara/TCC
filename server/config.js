// Exportando variáveis do .env
require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
};
