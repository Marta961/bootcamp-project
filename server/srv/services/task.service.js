// Persistencia en memoria (simulando base de datos)
let tasks = [];
let nextId = 1;

/**
 * Obtiene todas las tareas
 * @returns {Array} Array de tareas
 */
function obtenerTodas() {
  return tasks;
}

/**
 * Crea una nueva tarea
 * @param {Object} data - Datos de la tarea (titulo, prioridad)
 * @returns {Object} Tarea creada con ID
 */
function crearTarea(data) {
  const { titulo, prioridad } = data;

  // Validación interna del servicio
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    throw new Error('INVALID_TITLE');
  }

  if (prioridad !== undefined && typeof prioridad !== 'number') {
    throw new Error('INVALID_PRIORITY');
  }

  const nuevaTarea = {
    id: nextId++,
    titulo: titulo.trim(),
    prioridad: prioridad || 1,
    completada: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(nuevaTarea);
  return nuevaTarea;
}

/**
 * Elimina una tarea por ID
 * @param {number} id - ID de la tarea
 * @throws {Error} NOT_FOUND si la tarea no existe
 */
function eliminarTarea(id) {
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error('NOT_FOUND');
  }

  tasks.splice(index, 1);
}

/**
 * Marca una tarea como completada
 * @param {number} id - ID de la tarea
 * @throws {Error} NOT_FOUND si la tarea no existe
 */
function completarTarea(id) {
  const task = tasks.find(t => t.id === id);

  if (!task) {
    throw new Error('NOT_FOUND');
  }

  task.completada = true;
  return task;
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
  completarTarea
};