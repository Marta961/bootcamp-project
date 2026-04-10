/**
 * Capa de red: comunicación con el backend TaskFlow (REST).
 * Expone window.TaskflowApi para uso sin módulos ES (compatible con file:// y Live Server).
 * Base URL: meta taskflow-api-base, window.TASKFLOW_API_BASE o localhost por defecto.
 */
(function (global) {
  function resolveBaseUrl() {
    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="taskflow-api-base"]');
      if (meta && meta.getAttribute('content')) {
        return meta.getAttribute('content').replace(/\/$/, '');
      }
    }
    if (typeof global !== 'undefined' && global.TASKFLOW_API_BASE) {
      return String(global.TASKFLOW_API_BASE).replace(/\/$/, '');
    }
    return 'http://localhost:3000/api/v1';
  }

  function getBaseUrl() {
    return resolveBaseUrl();
  }

  class ApiError extends Error {
    constructor(status, message) {
      super(message || `Error HTTP ${status}`);
      this.status = status;
      this.name = 'ApiError';
    }
  }

  async function readErrorMessage(res) {
    const text = await res.text();
    if (!text) return res.statusText || 'Error desconocido';
    try {
      const data = JSON.parse(text);
      if (data && typeof data.error === 'string') return data.error;
      return text;
    } catch {
      return text;
    }
  }

  async function fetchTasks() {
    const res = await fetch(`${getBaseUrl()}/tasks`);
    if (!res.ok) {
      throw new ApiError(res.status, await readErrorMessage(res));
    }
    return res.json();
  }

  async function createTask(payload) {
    const res = await fetch(`${getBaseUrl()}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new ApiError(res.status, await readErrorMessage(res));
    }
    return res.json();
  }

  async function deleteTask(id) {
    const res = await fetch(`${getBaseUrl()}/tasks/${id}`, { method: 'DELETE' });
    if (res.status === 204) return;
    if (!res.ok) {
      throw new ApiError(res.status, await readErrorMessage(res));
    }
  }

  async function patchTask(id, body) {
    const res = await fetch(`${getBaseUrl()}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new ApiError(res.status, await readErrorMessage(res));
    }
    return res.json();
  }

  function mapPriorityToApi(priority) {
    if (priority === 'alta') return 3;
    if (priority === 'media') return 2;
    return 1;
  }

  function mapApiTaskToUi(apiTask) {
    let priority = 'media';
    if (apiTask.prioridad >= 3) priority = 'alta';
    else if (apiTask.prioridad === 2) priority = 'media';
    else priority = 'baja';

    const title = typeof apiTask.titulo === 'string' ? apiTask.titulo : '';
    return {
      id: apiTask.id,
      title,
      titleNormalized: title.toLowerCase(),
      completed: !!apiTask.completada,
      priority,
      createdAt: new Date().toISOString()
    };
  }

  global.TaskflowApi = {
    ApiError,
    fetchTasks,
    createTask,
    deleteTask,
    patchTask,
    mapPriorityToApi,
    mapApiTaskToUi
  };
})(typeof window !== 'undefined' ? window : globalThis);
