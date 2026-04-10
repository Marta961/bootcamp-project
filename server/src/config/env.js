require('dotenv').config();

/**
 * En Vercel (serverless) no necesitamos PORT para arrancar con listen.
 * Dejamos un valor por defecto para desarrollo local y evitamos romper el deploy.
 */
const portFromEnv = parseInt(process.env.PORT, 10);

module.exports = {
  PORT: Number.isNaN(portFromEnv) ? 3000 : portFromEnv,
  NODE_ENV: process.env.NODE_ENV || 'development'
};