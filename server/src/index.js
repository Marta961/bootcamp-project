const express = require('express');
const cors = require('cors');
const { PORT, NODE_ENV } = require('./config/env');
const taskRoutes = require('./routes/task.routes');

const app = express();

// Middlewares globales (origin: true refleja el origen de la petición, incl. null en file://)
app.use(cors({ origin: true }));
app.use(express.json());

// Ruta de salud (health check)
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor TaskFlow funcionando',
    environment: NODE_ENV 
  });
});

// Montar rutas de tareas bajo /api/v1/tasks
app.use('/api/v1/tasks', taskRoutes);

// Rutas no definidas (evita caer en el handler de errores sin ser un Error de aplicación)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

/**
 * Middleware global de errores (4 argumentos). Debe ir al final.
 * Mapea códigos de negocio conocidos a HTTP semántico; el resto → 500 genérico.
 */
app.use((err, req, res, next) => {
  const clientByMessage = {
    NOT_FOUND: { status: 404, body: { error: 'Tarea no encontrada.' } },
    INVALID_TITLE: {
      status: 400,
      body: { error: 'El título es obligatorio y debe tener al menos 3 caracteres.' }
    },
    INVALID_PRIORITY: {
      status: 400,
      body: { error: 'La prioridad debe ser un número positivo.' }
    },
    INVALID_COMPLETED: {
      status: 400,
      body: { error: 'El campo completada debe ser un valor booleano.' }
    }
  };

  const mapped = clientByMessage[err.message];
  if (mapped) {
    return res.status(mapped.status).json(mapped.body);
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${NODE_ENV}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`📋 Tasks: http://localhost:${PORT}/api/v1/tasks`);
});