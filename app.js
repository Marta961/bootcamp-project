// ESTADO DE LA APLICACIÓN
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

// REFERENCIAS AL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const completeAllBtn = document.getElementById('complete-all-btn');
const deleteCompletedBtn = document.getElementById('delete-completed-btn');
const themeToggle = document.getElementById('theme-toggle');

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
    renderTasks();
    updateStats();
    setupEventListeners();
});

// CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTasks();
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
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
    
    themeToggle.addEventListener('click', toggleTheme);
}

// MODO OSCURO
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

function updateThemeButtonText(theme) {
    const mobileIcon = themeToggle.querySelector('.mobile-icon');
    const desktopText = themeToggle.querySelector('.desktop-text');
    
    if (theme === 'dark') {
        if (mobileIcon) mobileIcon.textContent = '☀️';
        if (desktopText) desktopText.textContent = '☀️ Modo claro';
    } else {
        if (mobileIcon) mobileIcon.textContent = '🌙';
        if (desktopText) desktopText.textContent = '🌙 Modo oscuro';
    }
}

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
    
    if (title === '') {
        alert('Por favor, escribe una tarea');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    
    currentFilter = 'all';
    filterButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    
    renderTasks();
    updateStats();
    taskInput.value = '';
});

function getFilteredTasks() {
    let filtered = [...tasks];
    
    if (currentFilter === 'pending') {
        filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }
    
    if (searchQuery) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery));
    }
    
    return filtered;
}

function renderTasks() {
    tasksContainer.innerHTML = '';
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state text-center py-8 text-gray-500 dark:text-gray-400 italic';
        
        if (searchQuery) {
            emptyState.textContent = `No se encontraron tareas para "${searchQuery}"`;
        } else if (currentFilter === 'completed') {
            emptyState.textContent = 'No hay tareas completadas';
        } else if (currentFilter === 'pending') {
            emptyState.textContent = '¡Genial! No hay tareas pendientes';
        } else if (tasks.length === 0) {
            emptyState.textContent = 'No hay tareas aún. ¡Añade una!';
        } else {
            emptyState.textContent = 'No hay tareas para mostrar';
        }
        
        tasksContainer.appendChild(emptyState);
        return;
    }
    
    filteredTasks.forEach(task => {
        const li = createTaskElement(task);
        tasksContainer.appendChild(li);
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item flex justify-between items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 ${task.completed ? 'completed' : ''} dark:bg-gray-700`;
    li.dataset.id = task.id;
    
    li.innerHTML = `
        <div class="flex items-center gap-2 flex-1">
            <input type="checkbox" 
                   class="task-checkbox w-5 h-5 cursor-pointer" 
                   id="task-${task.id}" 
                   ${task.completed ? 'checked' : ''}
                   aria-label="Marcar tarea como completada: ${escapeHtml(task.title)}">
            <label for="task-${task.id}" class="task-title cursor-pointer ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}">${escapeHtml(task.title)}</label>
        </div>
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
    
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    
    checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            checkbox.checked = !checkbox.checked;
            toggleTaskCompletion(task.id);
        }
    });
    
    li.querySelectorAll('.task-actions button, .btn-edit, .btn-complete, .btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'complete') toggleTaskCompletion(task.id);
            else if (action === 'delete') deleteTask(task.id);
            else if (action === 'edit') editTask(task.id, li);
        });
    });
    
    return li;
}

function editTask(taskId, taskElement) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    taskElement.classList.add('editing');
    taskElement.innerHTML = `
        <div class="flex gap-2 w-full">
            <input type="text" class="task-edit-input flex-1 px-3 py-2 border-2 border-primary rounded text-base" value="${escapeHtml(task.title)}">
            <button class="btn-save px-4 py-2 bg-success text-white border-none rounded cursor-pointer text-sm">✓ Guardar</button>
            <button class="btn-cancel px-4 py-2 bg-gray-500 text-white border-none rounded cursor-pointer text-sm">✕ Cancelar</button>
        </div>
    `;
    
    const input = taskElement.querySelector('.task-edit-input');
    input.focus();
    input.select();
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit();
        else if (e.key === 'Escape') renderTasks();
    });
    
    taskElement.querySelector('.btn-save').addEventListener('click', saveEdit);
    taskElement.querySelector('.btn-cancel').addEventListener('click', () => renderTasks());
    
    function saveEdit() {
        const newTitle = input.value.trim();
        if (newTitle === '') {
            alert('El título no puede estar vacío');
            return;
        }
        task.title = newTitle;
        saveTasks();
        renderTasks();
    }
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = !task.completed;
    saveTasks();
    updateStats();
    
    updateSingleTaskElement(taskId);
}

function updateSingleTaskElement(taskId) {
    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    if (!taskElement) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Actualizar clases para animación
    if (task.completed) {
        taskElement.classList.add('completed');
        taskElement.classList.add('marked-complete');
        
        // Quitar la clase de animación después de 300ms
        setTimeout(() => {
            taskElement.classList.remove('marked-complete');
        }, 300);
    } else {
        taskElement.classList.remove('completed');
    }
    
    // Actualizar checkbox
    const checkbox = taskElement.querySelector('.task-checkbox');
    if (checkbox) checkbox.checked = task.completed;
    
    // Actualizar label
    const label = taskElement.querySelector('.task-title');
    if (label) {
        if (task.completed) {
            label.classList.add('line-through', 'text-gray-500', 'dark:text-gray-400');
        } else {
            label.classList.remove('line-through', 'text-gray-500', 'dark:text-gray-400');
        }
    }
}

function deleteTask(taskId) {
    // Encontrar el elemento en el DOM
    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    
    if (taskElement) {
        // Añadir clase de animación de salida
        taskElement.classList.add('deleting');
        
        // Esperar a que termine la animación (300ms) antes de borrar del DOM y del array
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
            updateStats();
        }, 300); 
    } else {
        // Fallback si no se encuentra el elemento (por si acaso)
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function markAllAsCompleted() {
    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length === 0) {
        alert('No hay tareas pendientes para marcar');
        return;
    }
    if (confirm(`¿Marcar ${pendingTasks.length} tareas como completadas?`)) {
        tasks.forEach(task => task.completed = true);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

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
            saveTasks();
            renderTasks();
            updateStats();
        }, 300);
    }
}

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

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (saved) {
            const data = JSON.parse(saved);
            if (data.version && data.tasks) tasks = data.tasks;
            else tasks = Array.isArray(saved) ? JSON.parse(saved) : [];
        } else {
            tasks = [];
        }
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        tasks = [];
    }
}

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

function clearAllData() {
    if (confirm('¿Estás seguro de que quieres borrar TODOS los datos?')) {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        tasks = [];
        renderTasks();
        updateStats();
    }
}

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

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.tasks && Array.isArray(data.tasks)) {
                tasks = data.tasks;
                saveTasks();
                renderTasks();
                updateStats();
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
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}