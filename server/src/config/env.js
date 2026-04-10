require('dotenv').config();

// Validación de variables de entorno críticas
const requiredEnvVars = ['PORT'];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`La variable de entorno ${varName} no está definida. Por favor, revisa tu archivo .env`);
  }
});

module.exports = {
  PORT: parseInt(process.env.PORT, 10),
  NODE_ENV: process.env.NODE_ENV || 'development'
};