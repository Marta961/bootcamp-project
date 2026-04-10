const { PORT, NODE_ENV } = require('./config/env');
const app = require('./app');

// Para Vercel: exportar la app como Serverless Function
module.exports = app;

// Para desarrollo local: arrancar el servidor normalmente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${NODE_ENV}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/v1/health`);
    console.log(`📋 Tasks: http://localhost:${PORT}/api/v1/tasks`);
  });
}