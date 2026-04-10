# TaskFlow - Listado de tareas
La aplicación es full-stack para la gestión de tareas con frontend web y backend REST en Node.js + Express con el manejo de errores HTTP y despliegue en Vercel.

## Características
- Consumo de APIs REST desde frontend.
- Arquitectura por capas en backend (routes/controllers/services).
- Manejo global de errores en Express.
- Flujo de despliegue frontend + backend en Vercel.

## Funcionalidades
- Crea tareas con diferentes nivel de prioridades.
- Filtra por pendientes, completadas o todas.
- Busca las tareas por texto.
- Marcar o desmarcar tareas como completadas.
- Edita el título de tarea.
- Elimina las tareas.
- Marcar todas las tareas como completadas.
- Borra las tareas completadas.
- Mostrar estados de red en UI: carga, éxito y error.

## Tecnologías
- Frontend:
  - HTML5, CSS3, JavaScript.
  - Tailwind CSS (CDN).
  - `fetch` para peticiones HTTP.
- Backend:
  - Node.js.
  - Express.
  - CORS.
  - Dotenv.
- Testing/API tools:
  - Postman / Thunder Client.
- Deploy:
  - Vercel.

## Estructura
bootcamp-project/
├── index.html
├── app.js
├── style.css
├── api/
│   └── index.js                 **Serverless function root para Vercel*
├── src/
│   └── api/
│       └── client.js            **Capa de red del frontend*
├── server/
│   ├── src/
│   │   ├── app.js               **App Express (middlewares + rutas)*
│   │   ├── index.js             **Arranque local con app.listen*
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── routes/
│   │   │   └── task.routes.js
│   │   ├── controllers/
│   │   │   └── task.controller.js
│   │   └── services/
│   │       └── task.service.js
│   ├── postman/
│   │   └── TaskFlow-Fase-C.postman_collection.json
│   └── vercel.json              **Configuración de deploy backend si se usa root server*
├── docs/
│   └── backend-api.md
└── vercel.json                  **Configuración de deploy full app en raíz*

### Desarrollo local
1. Backend:
   - `cd server`
   - `npm install`
   - crear `.env` con `PORT=3000`
   - `npm run dev`
2. Frontend (en otra terminal, raíz del repo):
   - `npm install`
   - `npm start`
3. Abrir:
   - frontend: `http://localhost:5173`
   - health backend: `http://localhost:3000/api/v1/health`

### Producción en Vercel
- Deploy del repositorio con root en `bootcamp-project`.
- `vercel.json` de raíz enruta:
  - `/api/*` -> función Node (`api/index.js`).
  - resto -> frontend estático (`index.html`).

**Pruebas:** Se comprueba que los botones funcionan correctamente:
- Me permite eliminar las tareas
- Generar nuevas tareas
- Las tareas persisten después de actualizar la página web
- No me deja introducir tareas si está vacío el campo
- Se me permite encontrar tareas en el buscador
- `GET /api/v1/health` responde `status: OK`.

**URL:** `https://bootcamp-project-xi.vercel.app/`