Tarea a realizar: Se realizará la documentación del uso de Cursor para mejorar el código y para indicar cuáles han sido los atajos más frecuentes que se han utilizado. 

**Atajos más utilizados en Cursor:**
- Ctrl + L: Abrir chat con la IA
- Ctrl + W: Cerrar chat con la IA
- Ctrl + Shift + Y: Para conservar los cambios generados por la IA.
- Ctrl + Shift + K: Para borrar la línea en la que estoy. 

**Refactorización por Cursor:**
**- La primera refactorización:** Me unifica la inicialización para obtener una mejor mantenibilidad.
**- La segunda refactorización:** Me unifica tareas que tienen un mismo patrón, como son saveTasks(), renderTasks(), updateStats() y tasks. De este modo, no hay duplicados que pueden generar errores en el futuro.
**- La tercera refactorización:** En el renderTasks, me cambia el condicional con la función getEmptyStateMessage() que es más concisa. 
**- La cuarta refactorización:** Me genera un campo derivado para guardar una tarea para que no sea repetivo cada render/keypress al separar los datos de las derivaciones. 
**- La quinta refactorización:** Me mejora el editTasks, dandole mayor legibilidad y simplicidad dado que mueve la lógica del guardado y cancelación a funciones separadas.   

**- Primera mejora de Cursor de mi código:**
Perfecto: primero voy a revisar index.html y app.js para detectar problemas de accesibilidad (etiquetas, semántica, foco, mensajes para lectores de pantalla, contraste, navegación con teclado). Luego te propongo e implemento mejoras en la primera “parte”. Voy a empezar leyendo ambos archivos.

Estoy viendo que el HTML/JS ya tiene buena base (landmarks, labels en botones, etc.), pero hay mejoras claras de accesibilidad: falta de etiquetas en inputs, falta de estado accesible en el tema y en los filtros, y los “contadores/área de tareas” no avisan a lectores de pantalla cuando cambian. Voy a aplicar la Parte 1 enfocándome en esos puntos y corrigiendo además un detalle en app.js donde los botones de acciones también se tratan como filtros.

index.html
+12
-9
    <form id="task-form" class="flex flex-col gap-4"> Lo ha añadido
      <label for="task-input" class="sr-only">Escribe una nueva tarea</label>
      <input type="text" id="task-input" placeholder="Escribe una nueva tarea..." required class="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:border-primary dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors">
      
      <label for="priority-select" class="sr-only">Selecciona la prioridad de la tarea</label>
      <select id="priority-select" class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary">
      <div class="w-full">
          <label for="search-input" class="sr-only">Buscar tareas</label>
          <input type="text" 
      
      <div class="flex gap-4 flex-wrap justify-center items-center"> Lo ha quitado
          <button class="filter-btn px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-full text-sm cursor-pointer transition-all hover:border-primary hover:text-primary dark:hover:text-primary text-gray-800 dark:text-gray-100" data-filter="pending">Pendientes</button>
          <button class="filter-btn px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-full text-sm cursor-pointer transition-all hover:border-primary hover:text-primary dark:hover:text-primary text-gray-800 dark:text-gray-100" data-filter="completed">Completadas</button>
          <button class="filter-btn active px-4 py-2 bg-primary text-white border-none rounded-full text-sm cursor-pointer transition-all hover:bg-primary-hover text-white" data-filter="all">Todas</button>
          <button id="complete-all-btn" class="filter-btn px-4 py-2 bg-primary text-white border-none rounded-full text-sm cursor-pointer transition-all hover:bg-primary-hover">✓ Marcar todas</button>
          <button id="delete-completed-btn" class="filter-btn px-4 py-2 bg-danger text-white border-none rounded-full text-sm cursor-pointer transition-all hover:bg-red-700 active">🗑️ Borrar completadas</button>
      <div class="flex gap-4 flex-wrap justify-center items-center" role="tablist" aria-label="Filtrar tareas"> Lo ha añadido
          <button class="filter-btn px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-full text-sm cursor-pointer transition-all hover:border-primary hover:text-primary dark:hover:text-primary text-gray-800 dark:text-gray-100" data-filter="pending" role="tab" aria-selected="false" tabindex="-1">Pendientes</button>
          <button class="filter-btn px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-full text-sm cursor-pointer transition-all hover:border-primary hover:text-primary dark:hover:text-primary text-gray-800 dark:text-gray-100" data-filter="completed" role="tab" aria-selected="false" tabindex="-1">Completadas</button>
          <button class="filter-btn active px-4 py-2 bg-primary text-white border-none rounded-full text-sm cursor-pointer transition-all hover:bg-primary-hover text-white" data-filter="all" role="tab" aria-selected="true" tabindex="0">Todas</button>
          <button id="complete-all-btn" type="button" class="filter-btn px-4 py-2 bg-primary text-white border-none rounded-full text-sm cursor-pointer transition-all hover:bg-primary-hover">✓ Marcar todas</button>
          <button id="delete-completed-btn" type="button" class="filter-btn px-4 py-2 bg-danger text-white border-none rounded-full text-sm cursor-pointer transition-all hover:bg-red-700 active">🗑️ Borrar completadas</button>
      </div>
  
  <ul id="tasks-container" class="space-y-2"> Lo ha quitado
  <ul id="tasks-container" class="space-y-2" role="region" aria-label="Listado de tareas" aria-live="polite" aria-relevant="additions text"> Lo ha añadido
      <li class="empty-state text-center py-8 text-gray-500 dark:text-gray-400 italic">No hay tareas aún. ¡Añade una!</li> Lo ha añadido
  
  <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"> Lo ha quitado
  <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700" role="status" aria-live="polite"> Lo ha añadido
      <span class="text-gray-700 dark:text-gray-300">Pendientes:</span> Lo ha añadido
  
  <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"> Lo ha quitado
  <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700" role="status" aria-live="polite"> Lo ha añadido
      <span class="text-gray-700 dark:text-gray-300">Completadas:</span> Lo ha añadido

app.js
+20
-7
const searchInput = document.getElementById('search-input'); Lo ha quitado
const filterButtons = document.querySelectorAll('.filter-btn'); Lo ha añadido
// Solo botones de filtrado (excluye acciones como "Marcar todas" / "Borrar completadas")
const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
const completeAllBtn = document.getElementById('complete-all-btn');
const themeToggle = document.getElementById('theme-toggle');
const initialFilter = currentFilter; Lo ha añadido
    updateStats();
    setActiveFilter(currentFilter); Lo ha añadido
    setupEventListeners();
});
function setActiveFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    }); Ha añadido esta función
}
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active')); Lo ha quitado
            btn.classList.add('active'); Lo ha quitado
            currentFilter = btn.dataset.filter; Lo ha quitado
            setActiveFilter(btn.dataset.filter); Ha añadido esta línea
            renderTasks(); 
        if (desktopText) desktopText.textContent = '☀️ Modo claro';
        themeToggle.setAttribute('aria-pressed', 'true');
        themeToggle.setAttribute('aria-label', 'Cambiar a modo claro'); Ha añadido esta línea
    } else {
        if (desktopText) desktopText.textContent = '🌙 Modo oscuro';
        themeToggle.setAttribute('aria-pressed', 'false'); Ha añadido esta línea
        themeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro'); Ha añadido esta línea
    }
    
    currentFilter = 'all'; Lo ha quitado
    filterButtons.forEach(b => b.classList.remove('active')); Lo ha quitado
    document.querySelector('[data-filter="all"]').classList.add('active'); Lo ha quitado
    setActiveFilter('all'); Ha añadido esta línea
He aplicado los cambios en index.html y app.js: ahora hay etiquetas accesibles (no solo placeholder), el bloque de tareas y contadores notifican a lectores de pantalla, y los botones de filtro tienen semántica de tab con aria-selected. También corregí que los botones de acciones no se traten como filtros. Ahora haré un pequeño ajuste para evitar un posible linter (una variable sin uso) y luego comprobaré lints.

app.js
-1
const themeToggle = document.getElementById('theme-toggle');
const initialFilter = currentFilter; Ha quitado esta línea
Listo: ya mejoré la accesibilidad (Parte 1) en index.html y app.js.

Cambios principales:

Añadí etiquetas accesibles (no solo placeholder) para task-input, priority-select y search-input usando label con clase sr-only.
Convertí el bloque de tareas en una zona “live” para lectores de pantalla: #tasks-container ahora usa role="region" y aria-live="polite" para que se enteren cuando cambie la lista.
Hice que Estadísticas sean anunciables con role="status" y aria-live="polite".
Mejoré navegación de filtros: los botones “Pendientes / Completadas / Todas” ahora son un tablist (role="tablist", role="tab", aria-selected, tabindex).
Corregí un detalle en app.js: ahora filterButtons solo incluye los botones con data-filter (evita que “Marcar todas” y “Borrar completadas” interfieran con el filtro).
El botón de tema oscuro/claro ahora actualiza aria-pressed y aria-label según el estado actual.

**- Segunda mejora de Cursor de mi código:**
Perfecto. Ahora voy a enfocarme en performance: reducir renders completos innecesarios, evitar crear muchos listeners en cada render y añadir debounce a la búsqueda. Primero reviso las secciones de app.js donde se hacen renderTasks() y los addEventListener() para aplicar los cambios sin romper accesibilidad.

Voy a aplicar la mejora de performance con 4 cambios en app.js: (1) debounce en la búsqueda, (2) evento delegado para checkbox y botones (en vez de listeners por cada tarea), (3) render con DocumentFragment y evitar copias innecesarias al filtrar, y (4) optimizar el reorder de drag & drop usando un Map. Luego verifico que siga funcionando.

app.js
+46
-29
let searchQuery = '';
let searchDebounceTimer = null; Lo ha añadido
function setupEventListeners() {
    // Debounce para no renderizar en cada pulsación Lo ha añadido
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim(); Lo ha quitado
        renderTasks();Lo ha quitado
        const nextQuery = e.target.value.toLowerCase().trim();
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            searchQuery = nextQuery;
            renderTasks();
        }, 150); Lo ha añadido
    });
    });
    
    // Delegación de eventos para evitar listeners por cada re-render Lo ha añadido
    tasksContainer.addEventListener('change', (e) => {
        const target = e.target;
        if (!target || !target.classList || !target.classList.contains('task-checkbox')) return;
        const li = target.closest('li[data-id]');
        if (!li) return;
        const taskId = parseInt(li.dataset.id, 10);
        if (Number.isNaN(taskId)) return;
        toggleTaskCompletion(taskId);
    }); Lo ha añadido
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
    }); Lo ha añadido
    
function getFilteredTasks() {
    let filtered = [...tasks]; Lo ha quitado
    let filtered = tasks; Lo ha añadido
    
    
    filteredTasks.forEach(task => {
        const li = createTaskElement(task);
        tasksContainer.appendChild(li);
    }); Lo ha quitado
    // Construir en fragmento para reducir reflows Lo ha añadido
    const fragment = document.createDocumentFragment(); Lo ha añadido
    filteredTasks.forEach(task => fragment.appendChild(createTaskElement(task))); Lo ha añdido
    tasksContainer.appendChild(fragment); Lo ha añadido
}
    `;
    
    const checkbox = li.querySelector('.task-checkbox'); Lo ha quitado
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id)); Lo ha quitado
    
    checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            checkbox.checked = !checkbox.checked;
            toggleTaskCompletion(task.id);
        }
    }); Lo ha quitado 
    
    li.querySelectorAll('.task-actions button, .btn-edit, .btn-complete, .btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'complete') toggleTaskCompletion(task.id);
            else if (action === 'delete') deleteTask(task.id);
            else if (action === 'edit') editTask(task.id, li);
        });
    }); Lo ha quitado
    
                const taskItems = Array.from(tasksContainer.querySelectorAll('.task-item'));
                const taskMap = new Map(tasks.map(t => [t.id, t]));Lo ha añadido
                
                    const taskId = parseInt(item.dataset.id);
                    const task = tasks.find(t => t.id === taskId); Lo ha quitado
                    const task = taskMap.get(taskId); Lo ha añadido
                    if (task) {
            }
Sí. Ya mejoré la performance (Parte 2) en app.js con estos cambios:

Búsqueda con debounce: ahora no hace renderTasks() en cada pulsación; espera ~150ms antes de filtrar.
Event Delegation: dejé de crear addEventListener por cada tarea renderizada. En su lugar, tasksContainer gestiona:
change en checkboxes (completar/no completar)
click en botones (edit/complete/delete)
Render más eficiente: renderTasks() ahora usa DocumentFragment para reducir reflows al pintar la lista.
Menos trabajo al filtrar: evité copiar el array completo con [...] en getFilteredTasks().
Drag & drop más rápido: en onEnd ahora se usa un Map (id -> task) en lugar de hacer tasks.find(...) por cada elemento.
Verificación rápida que deberías probar:

Escribir en el buscador (que responde fluido).
Filtrar “Pendientes/Completadas/Todas”.
Marcar/completar y editar/borrar varias tareas.
Reordenar con drag & drop (y que el orden persiste tras recargar). 

