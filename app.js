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
    // Limpiar contenedor
    tasksContainer.innerHTML = '';
    
    // Mostrar mensaje si no hay tareas
    if (tasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No hay tareas aún. ¡Añade una!';
        tasksContainer.appendChild(emptyState);
        return;
    }
    
    // Renderizar cada tarea
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
    
    // Añadir event listeners a los nuevos elementos
    addTaskEventListeners();
}

// Añadir event listeners a las tareas
function addTaskEventListeners() {
    // Checkbox para completar
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            toggleTaskCompletion(taskId);
        });
    });
    
    // Botones de acción
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

// LOCAL STORAGE

// Guardar tareas en LocalStorage
function saveTasks() {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
}

// Cargar tareas desde LocalStorage
function loadTasks() {
    const saved = localStorage.getItem('taskflow-tasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            tasks = [];
        }
    }
}

// UTILIDADES

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}