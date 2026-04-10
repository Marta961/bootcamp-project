const taskService = require('../services/task.service');

/**
 * GET /api/v1/tasks
 * Obtiene todas las tareas
 */
function obtenerTareas(req, res, next) {
  try {
    const tareas = taskService.obtenerTodas();
    res.status(200).json(tareas);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/tasks
 * Crea una nueva tarea
 */
function crearTarea(req, res, next) {
  try {
    const { titulo, prioridad } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
      throw new Error('INVALID_TITLE');
    }

    if (prioridad !== undefined && (typeof prioridad !== 'number' || prioridad < 1)) {
      throw new Error('INVALID_PRIORITY');
    }

    const nuevaTarea = taskService.crearTarea({ titulo, prioridad });
    res.status(201).json(nuevaTarea);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * Elimina una tarea
 */
function eliminarTarea(req, res, next) {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido.' });
    }

    taskService.eliminarTarea(taskId);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/tasks/:id/complete
 * Marca una tarea como completada
 */
function completarTarea(req, res, next) {
  try {
    const { id } = req.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido.' });
    }

    const tareaActualizada = taskService.completarTarea(taskId);
    res.status(200).json(tareaActualizada);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/tasks/:id
 * Actualización parcial: titulo, prioridad y/o completada.
 */
function patchTarea(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'El ID debe ser un número válido.' });
    }

    const { titulo, prioridad, completada } = req.body;
    const patch = {};
    if (titulo !== undefined) patch.titulo = titulo;
    if (prioridad !== undefined) patch.prioridad = prioridad;
    if (completada !== undefined) patch.completada = completada;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    const tareaActualizada = taskService.actualizarTarea(taskId, patch);
    res.status(200).json(tareaActualizada);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerTareas,
  crearTarea,
  eliminarTarea,
  completarTarea,
  patchTarea
};
