/* Carga src/api/client.js antes (define window.TaskflowApi). Sin módulos ES = compatible con abrir desde carpeta / Live Server. */
if (typeof window === 'undefined' || !window.TaskflowApi) {
  throw new Error(
    'Falta window.TaskflowApi: en index.html incluye <script src="src/api/client.js"></script> antes de app.js'
  );
}

const {
  ApiError,
  fetchTasks,
  createTask,
  deleteTask: apiDeleteTask,
  patchTask,
  mapApiTaskToUi,
  mapPriorityToApi
} = window.TaskflowApi;

// ESTADO DE LA APLICACIÓN (tareas = fuente de verdad del servidor; sin LocalStorage)
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let searchDebounceTimer = null;
let loadingDepth = 0;

const THEME_STORAGE_KEY = 'taskflow-theme';

const PRIORITY_CONFIG = {
  alta: {
    label: '🔴¡Urgente!',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  media: {
    label: '🟡Mediana',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  baja: {
    label: '🟢Baja',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
};

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
const completeAllBtn = document.getElementById('complete-all-btn');
const deleteCompletedBtn = document.getElementById('delete-completed-btn');
const themeToggle = document.getElementById('theme-toggle');
const networkLoading = document.getElementById('network-loading');
const networkError = document.getElementById('network-error');
const networkErrorText = document.getElementById('network-error-text');
const networkErrorDismiss = document.getElementById('network-error-dismiss');

function pushLoading(inc) {
  loadingDepth += inc ? 1 : -1;
  if (loadingDepth < 0) loadingDepth = 0;
  if (networkLoading) {
    networkLoading.classList.toggle('hidden', loadingDepth === 0);
    networkLoading.setAttribute('aria-busy', loadingDepth > 0 ? 'true' : 'false');
  }
}

function clearError() {
  if (networkError) networkError.classList.add('hidden');
  if (networkErrorText) networkErrorText.textContent = '';
}

/**
 * @param {unknown} e
 */
function showNetworkError(e) {
  if (!networkError || !networkErrorText) return;
  let message =
    'No se pudo conectar con el servidor. Comprueba que el backend esté en marcha (npm run dev en /server) y la URL de la API.';
  if (e instanceof ApiError) {
    message = e.message || `Error del servidor (${e.status})`;
  }
  networkErrorText.textContent = message;
  networkError.classList.remove('hidden');
}

async function reloadTasksFromServer() {
  const raw = await fetchTasks();
  tasks = normalizeTasks(raw.map(mapApiTaskToUi));
  renderTasks();
  updateStats();
}

/**
 * Carga inicial o refresco explícito con indicador de carga.
 */
async function loadTasksFromApi() {
  clearError();
  pushLoading(true);
  try {
    await reloadTasksFromServer();
  } catch (e) {
    showNetworkError(e);
    tasks = [];
    renderTasks();
    updateStats();
  } finally {
    pushLoading(false);
  }
}

/**
 * Reintenta traer el estado del servidor tras un fallo parcial (sin duplicar spinner si showSpinner es false).
 * @param {boolean} [showSpinner]
 */
async function syncAfterMutation(showSpinner = true) {
  if (showSpinner) pushLoading(true);
  try {
    await reloadTasksFromServer();
  } catch (e) {
    showNetworkError(e);
  } finally {
    if (showSpinner) pushLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();
  if (networkErrorDismiss) {
    networkErrorDismiss.addEventListener('click', clearError);
  }
  await loadTasksFromApi();
  setActiveFilter(currentFilter);
  setupEventListeners();
});

function setActiveFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((btn) => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
  });
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    const nextQuery = e.target.value.toLowerCase().trim();
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchQuery = nextQuery;
      renderTasks();
    }, 150);
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveFilter(btn.dataset.filter);
      renderTasks();
    });
  });

  completeAllBtn.addEventListener('click', () => {
    completeAllBtn.classList.add('active');
    setTimeout(() => completeAllBtn.classList.remove('active'), 500);
    markAllAsCompleted();
  });

  deleteCompletedBtn.addEventListener('click', () => {
    deleteCompletedBtn.classList.add('active');
    deleteCompletedTasks();
  });

  tasksContainer.addEventListener('change', (e) => {
    const target = e.target;
    if (!target || !target.classList || !target.classList.contains('task-checkbox')) return;

    const li = target.closest('li[data-id]');
    if (!li) return;

    const taskId = parseInt(li.dataset.id, 10);
    if (Number.isNaN(taskId)) return;

    const nextCompleted = !!target.checked;
    toggleTaskCompletion(taskId, nextCompleted);
  });

  tasksContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const li = btn.closest('li[data-id]');
    if (!li) return;

    const taskId = parseInt(li.dataset.id, 10);
    if (Number.isNaN(taskId)) return;

    const action = btn.dataset.action;
    if (action === 'complete') {
      const task = tasks.find((t) => t.id === taskId);
      if (task) toggleTaskCompletion(taskId, !task.completed);
    } else if (action === 'delete') deleteTask(taskId);
    else if (action === 'edit') editTask(taskId, li);
    else if (action === 'save-edit') handleSaveEdit(taskId, li);
    else if (action === 'cancel-edit') handleCancelEdit();
  });

  themeToggle.addEventListener('click', toggleTheme);
}

function renderOnly() {
  renderTasks();
  updateStats();
}

function normalizeTask(task) {
  if (!task || typeof task.title !== 'string') return task;
  const normalized =
    typeof task.titleNormalized === 'string' && task.titleNormalized
      ? task.titleNormalized
      : task.title.toLowerCase();
  return { ...task, titleNormalized: normalized };
}

function normalizeTasks(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeTask);
}

function getEmptyStateMessage() {
  if (searchQuery) return `No se encontraron tareas para "${searchQuery}"`;
  if (currentFilter === 'completed') return 'No hay tareas completadas';
  if (currentFilter === 'pending') return '¡Genial! No hay tareas pendientes';
  if (tasks.length === 0) return 'No hay tareas aún. ¡Añade una!';
  return 'No hay tareas para mostrar';
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    updateThemeButtonText('dark');
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeButtonText('light');
  }
}

function updateThemeButtonText(theme) {
  const mobileIcon = themeToggle.querySelector('.mobile-icon');
  const desktopText = themeToggle.querySelector('.desktop-text');

  if (theme === 'dark') {
    if (mobileIcon) mobileIcon.textContent = '☀️';
    if (desktopText) desktopText.textContent = '☀️ Modo claro';
    themeToggle.setAttribute('aria-pressed', 'true');
    themeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
  } else {
    if (mobileIcon) mobileIcon.textContent = '🌙';
    if (desktopText) desktopText.textContent = '🌙 Modo oscuro';
    themeToggle.setAttribute('aria-pressed', 'false');
    themeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
  }
}

function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    updateThemeButtonText('light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    updateThemeButtonText('dark');
  }
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  const prioritySelect = document.getElementById('priority-select');
  const priority = prioritySelect ? prioritySelect.value : 'media';

  if (title.length < 3) {
    showNetworkError(
      new ApiError(
        400,
        'El título debe tener al menos 3 caracteres (requisito de la API).'
      )
    );
    return;
  }

  pushLoading(true);
  clearError();
  try {
    await createTask({
      titulo: title,
      prioridad: mapPriorityToApi(priority)
    });
    taskInput.value = '';
    setActiveFilter('all');
    await reloadTasksFromServer();
  } catch (err) {
    showNetworkError(err);
  } finally {
    pushLoading(false);
  }
});

function getFilteredTasks() {
  let filtered = tasks;

  if (currentFilter === 'pending') {
    filtered = filtered.filter((t) => !t.completed);
  } else if (currentFilter === 'completed') {
    filtered = filtered.filter((t) => t.completed);
  }

  if (searchQuery) {
    filtered = filtered.filter((t) => {
      const normalized =
        typeof t.titleNormalized === 'string' && t.titleNormalized
          ? t.titleNormalized
          : (t.title || '').toLowerCase();
      return normalized.includes(searchQuery);
    });
  }

  return filtered;
}

function renderTasks() {
  tasksContainer.innerHTML = '';
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className =
      'empty-state text-center py-8 text-gray-500 dark:text-gray-400 italic';
    emptyState.textContent = getEmptyStateMessage();
    tasksContainer.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredTasks.forEach((task) => fragment.appendChild(createTaskElement(task)));
  tasksContainer.appendChild(fragment);
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item flex justify-between items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 ${
    task.completed ? 'completed' : ''
  } dark:bg-gray-700 task-priority-${task.priority}`;
  li.dataset.id = task.id;

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.media;
  const priorityLabel = priority.label;
  const priorityClass = priority.className;

  li.innerHTML = `
        <div class="flex items-center gap-2 flex-1">
            <input type="checkbox"
                   class="task-checkbox w-5 h-5 cursor-pointer"
                   id="task-${task.id}"
                   ${task.completed ? 'checked' : ''}
                   aria-label="Marcar tarea como completada: ${escapeHtml(task.title)}">
            <label for="task-${task.id}" class="task-title cursor-pointer ${
    task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
  }">${escapeHtml(task.title)}</label>
        </div>

        <span class="px-2 py-1 text-xs font-semibold rounded-full ${priorityClass} mr-2">
            ${priorityLabel}
        </span>

        <div class="flex gap-2">
            <button class="btn-edit px-3 py-1 bg-warning text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-yellow-600"
                    data-action="edit"
                    title="Editar"
                    aria-label="Editar tarea: ${escapeHtml(task.title)}">✎</button>
            <button class="btn-complete px-3 py-1 bg-success text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-green-600"
                    data-action="complete"
                    title="${task.completed ? 'Desmarcar' : 'Completar'}"
                    aria-label="${task.completed ? 'Desmarcar' : 'Completar'} tarea: ${escapeHtml(
    task.title
  )}">✓</button>
            <button class="btn-delete px-3 py-1 bg-danger text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-red-600"
                    data-action="delete"
                    title="Eliminar"
                    aria-label="Eliminar tarea: ${escapeHtml(task.title)}">✕</button>
        </div>
    `;

  return li;
}

function editTask(taskId, taskElement) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  taskElement.classList.add('editing');
  taskElement.innerHTML = `
        <div class="flex gap-2 w-full">
            <input type="text" class="task-edit-input flex-1 px-3 py-2 border-2 border-primary rounded text-base"
                   value="${escapeHtml(task.title)}"
                   aria-label="Editar título de la tarea">
            <button class="btn-save px-4 py-2 bg-success text-white border-none rounded cursor-pointer text-sm"
                    data-action="save-edit">✓ Guardar</button>
            <button class="btn-cancel px-4 py-2 bg-gray-500 text-white border-none rounded cursor-pointer text-sm"
                    data-action="cancel-edit">✕ Cancelar</button>
        </div>
    `;

  const input = taskElement.querySelector('.task-edit-input');
  input.focus();
  input.select();

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') handleSaveEdit(taskId, taskElement);
    else if (ev.key === 'Escape') handleCancelEdit();
  });
}

async function handleSaveEdit(taskId, taskElement) {
  const input = taskElement.querySelector('.task-edit-input');
  if (!input) return;

  const newTitle = input.value.trim();
  if (newTitle.length < 3) {
    showNetworkError(
      new ApiError(400, 'El título debe tener al menos 3 caracteres (requisito de la API).')
    );
    return;
  }

  pushLoading(true);
  clearError();
  try {
    await patchTask(taskId, { titulo: newTitle });
    await reloadTasksFromServer();
  } catch (err) {
    showNetworkError(err);
  } finally {
    pushLoading(false);
  }
}

function handleCancelEdit() {
  renderOnly();
}

async function toggleTaskCompletion(taskId, nextCompleted) {
  pushLoading(true);
  clearError();
  try {
    await patchTask(taskId, { completada: nextCompleted });
    await reloadTasksFromServer();
  } catch (err) {
    showNetworkError(err);
    try {
      await reloadTasksFromServer();
    } catch {
      /* ya mostrado */
    }
  } finally {
    pushLoading(false);
  }
}

async function deleteTask(taskId) {
  const taskElement = document.querySelector(`li[data-id="${taskId}"]`);

  const runDelete = async () => {
    pushLoading(true);
    clearError();
    try {
      await apiDeleteTask(taskId);
      await reloadTasksFromServer();
    } catch (err) {
      showNetworkError(err);
    } finally {
      pushLoading(false);
    }
  };

  if (taskElement) {
    taskElement.classList.add('deleting');
    setTimeout(runDelete, 300);
  } else {
    await runDelete();
  }
}

async function markAllAsCompleted() {
  const pendingTasks = tasks.filter((t) => !t.completed);
  if (pendingTasks.length === 0) {
    alert('No hay tareas pendientes para marcar');
    return;
  }
  if (!confirm(`¿Marcar ${pendingTasks.length} tareas como completadas?`)) return;

  pushLoading(true);
  clearError();
  try {
    await Promise.all(pendingTasks.map((t) => patchTask(t.id, { completada: true })));
    await reloadTasksFromServer();
  } catch (err) {
    showNetworkError(err);
    await syncAfterMutation(false);
  } finally {
    pushLoading(false);
  }
}

async function deleteCompletedTasks() {
  const completedTasks = tasks.filter((t) => t.completed);
  if (completedTasks.length === 0) {
    alert('No hay tareas completadas para borrar');
    return;
  }
  if (!confirm(`¿Borrar ${completedTasks.length} tareas completadas?`)) return;

  completedTasks.forEach((task) => {
    const taskElement = document.querySelector(`li[data-id="${task.id}"]`);
    if (taskElement) taskElement.classList.add('deleting');
  });

  pushLoading(true);
  clearError();
  setTimeout(async () => {
    try {
      await Promise.all(completedTasks.map((t) => apiDeleteTask(t.id)));
      await reloadTasksFromServer();
    } catch (err) {
      showNetworkError(err);
      await syncAfterMutation(false);
    } finally {
      pushLoading(false);
    }
  }, 300);
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  totalCount.textContent = total;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
