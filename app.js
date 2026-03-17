// ESTADO DE LA APLICACIÓN
let tasks = [];

// REFERENCIAS AL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksContainer = document.getElementById('tasks-container');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateStats();
});

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

// Renderizar todas las tareas
function renderTasks() {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No hay tareas aún. ¡Añade una!';
        tasksContainer.appendChild(emptyState);
        return;
    }
    
    tasks.forEach(task => {
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
                <button class="btn-complete" 
                        aria-label="Marcar como completada"
                        data-action="complete">
                    ✓
                </button>
                <button class="btn-delete" 
                        aria-label="Eliminar tarea"
                        data-action="delete">
                    ✕
                </button>
            </div>
        `;
        
        tasksContainer.appendChild(li);
    });
    
    addTaskEventListeners();
}

// Añadir event listeners a las tareas
function addTaskEventListeners() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            toggleTaskCompletion(taskId);
        });
    });
    
    document.querySelectorAll('.task-actions button').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            const action = e.target.dataset.action;
            
            if (action === 'complete') {
                toggleTaskCompletion(taskId);
            } else if (action === 'delete') {
                deleteTask(taskId);
            }
        });
    });
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

// Actualizar estadísticas
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// LOCAL STORAGE MEJORADO (PASO 7)

// Constantes para claves de almacenamiento
const STORAGE_KEYS = {
    TASKS: 'taskflow-tasks',
    THEME: 'taskflow-theme',
    SETTINGS: 'taskflow-settings'
};

// Versión de datos (para migraciones futuras)
const DATA_VERSION = 1;

// Guardar tareas con manejo de errores mejorado
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

// Cargar tareas con validación
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

// Verificar si LocalStorage está disponible
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

// Limpiar todos los datos
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

// Exportar datos (backup)
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

// Importar datos (restore)
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

// Verificar disponibilidad al iniciar
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