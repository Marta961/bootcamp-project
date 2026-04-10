const { PORT, NODE_ENV } = require('./config/env');
const app = require('./app');

// Iniciar servidor (solo local; en Vercel se exporta la app sin listen)
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${NODE_ENV}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`📋 Tasks: http://localhost:${PORT}/api/v1/tasks`);
});