let nextId = 1;
const tareas = [];

function obtenerTodas() {
  return [...tareas];
}

function crearTarea({ titulo, prioridad }) {
  const tituloLimpio = typeof titulo === 'string' ? titulo.trim() : '';
  if (tituloLimpio.length < 3) {
    const err = new Error('INVALID_TITLE');
    throw err;
  }

  if (prioridad !== undefined && (typeof prioridad !== 'number' || prioridad < 1)) {
    const err = new Error('INVALID_PRIORITY');
    throw err;
  }

  const nueva = {
    id: nextId++,
    titulo: tituloLimpio,
    prioridad: prioridad ?? 1,
    completada: false
  };
  tareas.push(nueva);
  return nueva;
}

function eliminarTarea(id) {
  const idx = tareas.findIndex((t) => t.id === id);
  if (idx === -1) {
    throw new Error('NOT_FOUND');
  }
  tareas.splice(idx, 1);
}

function actualizarTarea(id, patch) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) {
    throw new Error('NOT_FOUND');
  }

  if (patch.titulo !== undefined) {
    const tituloLimpio = typeof patch.titulo === 'string' ? patch.titulo.trim() : '';
    if (tituloLimpio.length < 3) {
      throw new Error('INVALID_TITLE');
    }
    tarea.titulo = tituloLimpio;
  }

  if (patch.prioridad !== undefined) {
    if (typeof patch.prioridad !== 'number' || patch.prioridad < 1) {
      throw new Error('INVALID_PRIORITY');
    }
    tarea.prioridad = patch.prioridad;
  }

  if (patch.completada !== undefined) {
    if (typeof patch.completada !== 'boolean') {
      throw new Error('INVALID_COMPLETED');
    }
    tarea.completada = patch.completada;
  }

  return { ...tarea };
}

function completarTarea(id) {
  return actualizarTarea(id, { completada: true });
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
  completarTarea,
  actualizarTarea
};
