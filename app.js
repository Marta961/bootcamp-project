// ESTADO DE LA APLICACIÓN
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let searchDebounceTimer = null;

/**
 * Configuración visual por prioridad.
 * Centralizado el texto y clases para evitar `if/else` repetitivos.
 */
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

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string=} titleNormalized
 * @property {boolean} completed
 * @property {'alta'|'media'|'baja'} priority
 * @property {string} createdAt
 */

// REFERENCIAS AL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const searchInput = document.getElementById('search-input');
// Solo botones de filtrado (excluye acciones como "Marcar todas" / "Borrar completadas")
const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
const completeAllBtn = document.getElementById('complete-all-btn');
const deleteCompletedBtn = document.getElementById('delete-completed-btn');
const themeToggle = document.getElementById('theme-toggle');

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
    renderTasks();
    updateStats();
    setActiveFilter(currentFilter);
    setupEventListeners();
    initDragAndDrop();
});

/**
 * Cambia el filtro activo y actualiza clases + atributos ARIA para accesibilidad.
 * @param {'all'|'pending'|'completed'} filter
 */
function setActiveFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
}

// CONFIGURAR EVENT LISTENERS
/**
 * Registra los manejadores de UI (búsqueda, filtros, acciones globales y delegación de eventos).
 */
function setupEventListeners() {
    // Debounce para no renderizar en cada pulsación
    searchInput.addEventListener('input', (e) => {
        const nextQuery = e.target.value.toLowerCase().trim();
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            searchQuery = nextQuery;
            renderTasks();
        }, 150);
    });
    
    filterButtons.forEach(btn => {
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
    
    // Delegación de eventos para evitar listeners por cada re-render
    tasksContainer.addEventListener('change', (e) => {
        const target = e.target;
        if (!target || !target.classList || !target.classList.contains('task-checkbox')) return;

        const li = target.closest('li[data-id]');
        if (!li) return;

        const taskId = parseInt(li.dataset.id, 10);
        if (Number.isNaN(taskId)) return;

        toggleTaskCompletion(taskId);
    });

    tasksContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const li = btn.closest('li[data-id]');
        if (!li) return;

        const taskId = parseInt(li.dataset.id, 10);
        if (Number.isNaN(taskId)) return;

        const action = btn.dataset.action;
        if (action === 'complete') toggleTaskCompletion(taskId);
        else if (action === 'delete') deleteTask(taskId);
        else if (action === 'edit') editTask(taskId, li);
        else if (action === 'save-edit') handleSaveEdit(taskId, li);
        else if (action === 'cancel-edit') handleCancelEdit();
    });
    
    themeToggle.addEventListener('click', toggleTheme);
}

// Helpers de render / persistencia
/**
 * Actualiza la interfaz (render + contadores) sin persistir en almacenamiento.
 */
function renderOnly() {
    renderTasks();
    updateStats();
}

/**
 * Persiste tareas en `localStorage` y luego actualiza toda la UI.
 */
function persistAndRender() {
    saveTasks();
    renderTasks();
    updateStats();
}

/**
 * Persiste tareas en `localStorage` y actualiza únicamente los contadores.
 */
function persistAndUpdateStatsOnly() {
    saveTasks();
    updateStats();
}

// Normaliza campos derivados para acelerar filtros
/**
 * Normaliza el título de una tarea para búsquedas (p.ej. en minúsculas).
 * @param {Task} task
 * @returns {Task}
 */
function normalizeTask(task) {
    if (!task || typeof task.title !== 'string') return task;
    const normalized = (typeof task.titleNormalized === 'string' && task.titleNormalized) ? task.titleNormalized : task.title.toLowerCase();
    return { ...task, titleNormalized: normalized };
}

/**
 * Normaliza un array de tareas.
 * @param {Task[]} list
 * @returns {Task[]}
 */
function normalizeTasks(list) {
    if (!Array.isArray(list)) return [];
    return list.map(normalizeTask);
}

/**
 * Devuelve el mensaje que se muestra cuando no hay resultados para el filtro actual.
 * @returns {string}
 */
function getEmptyStateMessage() {
    if (searchQuery) return `No se encontraron tareas para "${searchQuery}"`;
    if (currentFilter === 'completed') return 'No hay tareas completadas';
    if (currentFilter === 'pending') return '¡Genial! No hay tareas pendientes';
    if (tasks.length === 0) return 'No hay tareas aún. ¡Añade una!';
    return 'No hay tareas para mostrar';
}

// MODO OSCURO
/**
 * Carga el tema desde `localStorage` (o aplica preferencia del sistema).
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('taskflow-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        updateThemeButtonText('dark');
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeButtonText('light');
    }
}

/**
 * Actualiza el texto e indicadores ARIA del botón de tema en función del estado.
 * @param {'dark'|'light'} theme
 */
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

/**
 * Alterna entre modo claro/oscuro y guarda la preferencia.
 */
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('taskflow-theme', 'light');
        updateThemeButtonText('light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('taskflow-theme', 'dark');
        updateThemeButtonText('dark');
    }
}

// FUNCIONES PRINCIPALES
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    // CAPTURAR PRIORIDAD
    const prioritySelect = document.getElementById('priority-select');
    const priority = prioritySelect ? prioritySelect.value : 'media'; // Default a media si no existe

    if (title === '') {
        alert('Por favor, escribe una tarea');
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        titleNormalized: title.toLowerCase(),
        completed: false,
        priority: priority,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    
    setActiveFilter('all');
    persistAndRender();
    taskInput.value = '';
});

/**
 * Aplica filtros de estado (pendientes/completadas/todas) y búsqueda a la lista global `tasks`.
 * @returns {Task[]}
 */
function getFilteredTasks() {
    let filtered = tasks;
    
    if (currentFilter === 'pending') {
        filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }
    
    if (searchQuery) {
        filtered = filtered.filter(t => {
            const normalized = (typeof t.titleNormalized === 'string' && t.titleNormalized) ? t.titleNormalized : (t.title || '').toLowerCase();
            return normalized.includes(searchQuery);
        });
    }
    
    return filtered;
}

/**
 * Renderiza la lista de tareas según filtros (búsqueda + estado) y actualiza contadores en conjunto.
 * (Los contadores se actualizan fuera, pero se deja preparado para un flujo consistente.)
 */
function renderTasks() {
    tasksContainer.innerHTML = '';
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state text-center py-8 text-gray-500 dark:text-gray-400 italic';

        emptyState.textContent = getEmptyStateMessage();
        tasksContainer.appendChild(emptyState);
        return;
    }
    
    // Construir en fragmento para reducir reflows
    const fragment = document.createDocumentFragment();
    filteredTasks.forEach(task => fragment.appendChild(createTaskElement(task)));
    tasksContainer.appendChild(fragment);
}

/**
 * Crea el elemento DOM de una tarea (incluye acciones edit/complete/delete).
 * @param {Task} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item flex justify-between items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 ${task.completed ? 'completed' : ''} dark:bg-gray-700 task-priority-${task.priority}`;
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
            <label for="task-${task.id}" class="task-title cursor-pointer ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}">${escapeHtml(task.title)}</label>
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
                    aria-label="${task.completed ? 'Desmarcar' : 'Completar'} tarea: ${escapeHtml(task.title)}">✓</button>
            <button class="btn-delete px-3 py-1 bg-danger text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-red-600" 
                    data-action="delete" 
                    title="Eliminar"
                    aria-label="Eliminar tarea: ${escapeHtml(task.title)}">✕</button>
        </div>
    `;
    
    return li;
}

/**
 * Pone una tarea en modo edición (reemplaza el contenido por input + botones de guardar/cancelar).
 * @param {number} taskId
 * @param {HTMLLIElement} taskElement
 */
function editTask(taskId, taskElement) {
    const task = tasks.find(t => t.id === taskId);
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
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSaveEdit(taskId, taskElement);
        else if (e.key === 'Escape') handleCancelEdit();
    });
}

/**
 * Guarda el título editado y vuelve a la vista normal.
 * @param {number} taskId
 * @param {HTMLLIElement} taskElement
 */
function handleSaveEdit(taskId, taskElement) {
    const input = taskElement.querySelector('.task-edit-input');
    if (!input) return;

    const newTitle = input.value.trim();
    if (newTitle === '') {
        alert('El título no puede estar vacío');
        return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.title = newTitle;
    task.titleNormalized = newTitle.toLowerCase();

    persistAndRender();
}

/**
 * Cancela la edición y restaura la UI desde el estado actual.
 */
function handleCancelEdit() {
    renderOnly();
}

/**
 * Alterna el estado `completed` de una tarea y actualiza la UI.
 * @param {number} taskId
 */
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = !task.completed;
    persistAndUpdateStatsOnly();

    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    if (taskElement) {
        updateSingleTaskElement(task, taskElement);
    }
}

/**
 * Actualiza el DOM de la tarea (animaciones/clases/checkbox/estilo del label) sin re-renderizar toda la lista.
 * @param {Task} task
 * @param {HTMLLIElement} taskElement
 */
function updateSingleTaskElement(task, taskElement) {
    // Actualizar clases para animación
    taskElement.classList.toggle('completed', task.completed);
    if (task.completed) {
        taskElement.classList.add('marked-complete');
        // Quitar la clase de animación después de 300ms
        setTimeout(() => taskElement.classList.remove('marked-complete'), 300);
    } else {
        taskElement.classList.remove('marked-complete');
    }
    
    // Actualizar checkbox
    const checkbox = taskElement.querySelector('.task-checkbox');
    if (checkbox) checkbox.checked = task.completed;
    
    // Actualizar label
    const label = taskElement.querySelector('.task-title');
    if (label) {
        label.classList.toggle('line-through', task.completed);
        label.classList.toggle('text-gray-500', task.completed);
        label.classList.toggle('dark:text-gray-400', task.completed);
    }
}

/**
 * Elimina una tarea tras la animación de salida (300ms).
 * @param {number} taskId
 */
function deleteTask(taskId) {
    // Encontrar el elemento en el DOM
    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    
    if (taskElement) {
        // Añadir clase de animación de salida
        taskElement.classList.add('deleting');
        
        // Esperar a que termine la animación (300ms) antes de borrar del DOM y del array
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            persistAndRender();
        }, 300); 
    } else {
        // Fallback si no se encuentra el elemento (por si acaso)
        tasks = tasks.filter(t => t.id !== taskId);
        persistAndRender();
    }
}

/**
 * Marca todas las tareas como completadas (si hay pendientes).
 */
function markAllAsCompleted() {
    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length === 0) {
        alert('No hay tareas pendientes para marcar');
        return;
    }
    if (confirm(`¿Marcar ${pendingTasks.length} tareas como completadas?`)) {
        tasks.forEach(task => task.completed = true);
        persistAndRender();
    }
}

/**
 * Borra todas las tareas completadas (si hay alguna).
 */
function deleteCompletedTasks() {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) {
        alert('No hay tareas completadas para borrar');
        return;
    }
    if (confirm(`¿Borrar ${completedTasks.length} tareas completadas?`)) {
        completedTasks.forEach(task => {
            const taskElement = document.querySelector(`li[data-id="${task.id}"]`);
            if (taskElement) {
                taskElement.classList.add('deleting');
            }
        });
        
        setTimeout(() => {
            tasks = tasks.filter(t => !t.completed);
            persistAndRender();
        }, 300);
    }
}

/**
 * Actualiza los contadores de la UI (total, completadas y pendientes).
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// LOCAL STORAGE
const STORAGE_KEYS = {
    TASKS: 'taskflow-tasks',
    THEME: 'taskflow-theme',
    SETTINGS: 'taskflow-settings'
};

const DATA_VERSION = 1;

function saveTasks() {
    try {
        const data = { version: DATA_VERSION, tasks: tasks, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data));
    } catch (error) {
        console.error('Error al guardar tareas:', error);
    }
}

/**
 * Carga tareas desde `localStorage` y las normaliza para asegurar compatibilidad con versiones previas.
 */
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.version && Array.isArray(parsed.tasks)) {
                tasks = normalizeTasks(parsed.tasks);
            } else {
                tasks = normalizeTasks(Array.isArray(parsed) ? parsed : []);
            }
        } else {
            tasks = [];
        }
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        tasks = [];
    }
}

/**
 * Comprueba si `localStorage` está disponible y usable en este navegador.
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Borra TODOS los datos persistidos y actualiza la UI.
 */
function clearAllData() {
    if (confirm('¿Estás seguro de que quieres borrar TODOS los datos?')) {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        tasks = [];
        renderOnly();
    }
}

/**
 * Exporta las tareas a un archivo JSON descargable.
 */
function exportData() {
    const dataStr = JSON.stringify({ version: DATA_VERSION, tasks: tasks, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Importa tareas desde un archivo JSON local.
 * @param {File} file
 */
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.tasks && Array.isArray(data.tasks)) {
                tasks = normalizeTasks(data.tasks);
                persistAndRender();
                alert('✅ Datos importados correctamente');
            } else {
                alert('❌ Formato de archivo inválido');
            }
        } catch (error) {
            alert('❌ Error al leer el archivo');
        }
    };
    reader.readAsText(file);
}

if (!isLocalStorageAvailable()) {
    console.warn('⚠️ LocalStorage no está disponible.');
    alert('LocalStorage no está disponible. Algunos datos podrían perderse.');
}

// UTILIDADES
/**
 * Escapa texto HTML para evitar inyección al insertar en `innerHTML`.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Inicializa la funcionalidad de drag & drop (Sortable) sobre el contenedor de tareas.
 * Reordena preservando tareas no visibles si hay filtros activos.
 */
function initDragAndDrop() {
    if (!tasksContainer || typeof Sortable === 'undefined') return;

    new Sortable(tasksContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        delay: 100,
        delayOnTouchOnly: true,
        onEnd: function(evt) {
            // Orden visual actual (solo los elementos visibles)
            const taskItems = Array.from(tasksContainer.querySelectorAll('.task-item'));
            const visibleIds = taskItems
                .map(item => parseInt(item.dataset.id, 10))
                .filter(id => !Number.isNaN(id));
            const visibleSet = new Set(visibleIds);

            // Reordenar SOLO en las posiciones que ocupan las tareas visibles
            // (evita perder tareas ocultas por filtros)
            const originalTasks = tasks.slice();
            const taskMap = new Map(originalTasks.map(t => [t.id, t]));

            const visiblePositions = [];
            originalTasks.forEach((t, idx) => {
                if (visibleSet.has(t.id)) visiblePositions.push(idx);
            });

            const nextTasks = originalTasks.slice();
            visiblePositions.forEach((pos, j) => {
                const nextId = visibleIds[j];
                if (typeof nextId === 'number' && taskMap.has(nextId)) {
                    nextTasks[pos] = taskMap.get(nextId);
                }
            });

            tasks = nextTasks;
            saveTasks();
        }
    });
}