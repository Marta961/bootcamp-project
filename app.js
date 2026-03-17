// ESTADO DE LA APLICACIÓN
let tasks = [];
let currentFilter = 'all'; // Filtro activo: 'all', 'pending', 'completed'
let searchQuery = ''; // Texto de búsqueda

// REFERENCIAS AL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');

// Nuevas referencias (Paso 8)
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const completeAllBtn = document.getElementById('complete-all-btn');
const deleteCompletedBtn = document.getElementById('delete-completed-btn');

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateStats();
    setupEventListeners();
});

// CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
    // Búsqueda
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTasks();
    });
    
    // Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botón activo
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar filtro
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    // Marcar todas como completadas
    completeAllBtn.addEventListener('click', markAllAsCompleted);
    
    // Borrar completadas
    deleteCompletedBtn.addEventListener('click', deleteCompletedTasks);
}

// FUNCIONES PRINCIPALES

// Añadir nueva tarea
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
    renderTasks();
    updateStats();
    
    taskInput.value = '';
});

// Obtener tareas filtradas
function getFilteredTasks() {
    let filtered = [...tasks];
    
    // Aplicar filtro de estado
    if (currentFilter === 'pending') {
        filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }
    
    // Aplicar búsqueda
    if (searchQuery) {
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(searchQuery)
        );
    }
    
    return filtered;
}

// Renderizar todas las tareas
function renderTasks() {
    tasksContainer.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    // Mostrar mensaje si no hay tareas
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        
        if (searchQuery) {
            emptyState.textContent = `No se encontraron tareas para "${searchQuery}"`;
            emptyState.className = 'no-results';
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
    
    // Renderizar cada tarea
    filteredTasks.forEach(task => {
        const li = createTaskElement(task);
        tasksContainer.appendChild(li);
    });
}

// Crear elemento de tarea
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    
    li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-checkbox" 
                   id="task-${task.id}" 
                   ${task.completed ? 'checked' : ''}>
            <label for="task-${task.id}" class="task-title">${escapeHtml(task.title)}</label>
        </div>
        <div class="task-actions">
            <button class="btn-edit" 
                    aria-label="Editar tarea"
                    data-action="edit"
                    title="Editar">
                ✎
            </button>
            <button class="btn-complete" 
                    aria-label="Marcar como completada"
                    data-action="complete"
                    title="${task.completed ? 'Desmarcar' : 'Completar'}">
                ✓
            </button>
            <button class="btn-delete" 
                    aria-label="Eliminar tarea"
                    data-action="delete"
                    title="Eliminar">
                ✕
            </button>
        </div>
    `;
    
    // Event listeners para los botones
    li.querySelector('.task-checkbox').addEventListener('change', () => {
        toggleTaskCompletion(task.id);
    });
    
    li.querySelectorAll('.task-actions button').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            if (action === 'complete') {
                toggleTaskCompletion(task.id);
            } else if (action === 'delete') {
                deleteTask(task.id);
            } else if (action === 'edit') {
                editTask(task.id, li);
            }
        });
    });
    
    return li;
}

// Editar tarea
function editTask(taskId, taskElement) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Crear modo edición
    taskElement.classList.add('editing');
    taskElement.innerHTML = `
        <div class="task-content" style="display: flex; gap: 0.5rem; width: 100%;">
            <input type="text" class="task-edit-input" value="${escapeHtml(task.title)}">
            <button class="btn-save" data-action="save" style="background-color: var(--color-success); color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">
                ✓ Guardar
            </button>
            <button class="btn-cancel" data-action="cancel" style="background-color: #64748b; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">
                ✕ Cancelar
            </button>
        </div>
    `;
    
    const input = taskElement.querySelector('.task-edit-input');
    const saveBtn = taskElement.querySelector('.btn-save');
    const cancelBtn = taskElement.querySelector('.btn-cancel');
    
    // Focus en el input
    input.focus();
    input.select();
    
    // Guardar con Enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            renderTasks();
        }
    });
    
    // Guardar
    saveBtn.addEventListener('click', saveEdit);
    
    // Cancelar
    cancelBtn.addEventListener('click', () => renderTasks());
    
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

// Alternar estado de completada
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Eliminar tarea
function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Marcar todas como completadas
function markAllAsCompleted() {
    const pendingTasks = tasks.filter(t => !t.completed);
    
    if (pendingTasks.length === 0) {
        alert('No hay tareas pendientes para marcar');
        return;
    }
    
    if (confirm(`¿Marcar ${pendingTasks.length} tareas como completadas?`)) {
        tasks.forEach(task => {
            task.completed = true;
        });
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Borrar tareas completadas
function deleteCompletedTasks() {
    const completedTasks = tasks.filter(t => t.completed);
    
    if (completedTasks.length === 0) {
        alert('No hay tareas completadas para borrar');
        return;
    }
    
    if (confirm(`¿Borrar ${completedTasks.length} tareas completadas?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Actualizar estadísticas
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
        const data = {
            version: DATA_VERSION,
            tasks: tasks,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data));
        console.log('✅ Tareas guardadas correctamente');
    } catch (error) {
        console.error('❌ Error al guardar tareas:', error);
        alert('No se pudieron guardar los datos. Verifica que LocalStorage esté habilitado.');
    }
}

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (saved) {
            const data = JSON.parse(saved);
            if (data.version && data.tasks) {
                tasks = data.tasks;
                console.log(`✅ ${tasks.length} tareas cargadas (versión ${data.version})`);
            } else {
                console.warn('⚠️ Datos antiguos detectados, migrando...');
                tasks = Array.isArray(saved) ? JSON.parse(saved) : [];
            }
        } else {
            console.log('ℹ️ No hay tareas guardadas (primer uso)');
            tasks = [];
        }
    } catch (error) {
        console.error('❌ Error al cargar tareas:', error);
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
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        tasks = [];
        renderTasks();
        updateStats();
        console.log('🗑️ Todos los datos eliminados');
    }
}

function exportData() {
    const dataStr = JSON.stringify({
        version: DATA_VERSION,
        tasks: tasks,
        exportedAt: new Date().toISOString()
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('📥 Datos exportados');
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
            console.error('Error al importar:', error);
            alert('❌ Error al leer el archivo');
        }
    };
    
    reader.readAsText(file);
}

// Verificar la disponibilidad al iniciar
if (!isLocalStorageAvailable()) {
    console.warn('⚠️ LocalStorage no está disponible. Los datos no se guardarán.');
    alert('LocalStorage no está disponible. Algunos datos podrían perderse al recargar.');
}

// UTILIDADES

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}