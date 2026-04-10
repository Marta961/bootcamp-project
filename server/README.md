# TaskFlow Backend

Backend REST de TaskFlow construido con Node.js y Express.

## Estructura

```text
server/
├── api/
│   └── index.js                   # Entrypoint serverless para Vercel
├── postman/
│   └── TaskFlow-Fase-C.postman_collection.json
├── src/
│   ├── app.js                     # Configuración de Express + middlewares
│   ├── index.js                   # Arranque local con app.listen
│   ├── config/
│   │   └── env.js                 # Variables de entorno
│   ├── routes/
│   │   └── task.routes.js         # Definición de endpoints
│   ├── controllers/
│   │   └── task.controller.js     # Lógica HTTP (req/res)
│   └── services/
│       └── task.service.js        # Lógica de negocio en memoria
├── package.json
└── vercel.json
```

## API

Base URL local: `http://localhost:3000/api/v1`  
Base URL producción: `https://bootcamp-project-xi.vercel.app/api/v1`

### Endpoints

- `GET /health` - Estado del servicio.
- `GET /tasks` - Obtener todas las tareas.
- `POST /tasks` - Crear una tarea.
- `PATCH /tasks/:id` - Actualización parcial (`titulo`, `prioridad`, `completada`).
- `PATCH /tasks/:id/complete` - Marcar como completada.
- `DELETE /tasks/:id` - Eliminar una tarea.

Ejemplos rápidos:

```bash
curl -s https://bootcamp-project-xi.vercel.app/api/v1/health
```

```bash
curl -s -X POST https://bootcamp-project-xi.vercel.app/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Preparar entrega","prioridad":2}'
```

## Seguimiento de errores

El backend implementa manejo global de errores en `src/app.js`:

- Mapeo semántico:
  - `NOT_FOUND` -> `404`
  - `INVALID_TITLE` -> `400`
  - `INVALID_PRIORITY` -> `400`
  - `INVALID_COMPLETED` -> `400`
- Error no controlado:
  - log en consola con `console.error(err)`
  - respuesta `500` con mensaje genérico

Fragmento real:

```js
app.use((err, req, res, next) => {
  const clientByMessage = {
    NOT_FOUND: { status: 404, body: { error: 'Tarea no encontrada.' } },
    INVALID_TITLE: { status: 400, body: { error: 'El título es obligatorio y debe tener al menos 3 caracteres.' } }
  };

  const mapped = clientByMessage[err.message];
  if (mapped) return res.status(mapped.status).json(mapped.body);

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});
```

## Postman

Colección incluida:

- `postman/TaskFlow-Fase-C.postman_collection.json`

Incluye pruebas de:
- Casos válidos (GET/POST).
- Errores forzados:
  - POST sin título.
  - Prioridad inválida.
  - DELETE/PATCH de tarea inexistente.
  - Ruta inexistente.

## Estructura de JSON

### Tarea

```json
{
  "id": 1,
  "titulo": "Preparar entrega",
  "prioridad": 2,
  "completada": false
}
```

### Error

```json
{
  "error": "El título es obligatorio y debe tener al menos 3 caracteres."
}
```

## Swagger (OpenAPI)

Actualmente no hay especificación OpenAPI activa en el repo. Recomendación:

1. Crear `openapi.yaml` en `server/docs/`.
2. Documentar endpoints, esquemas y códigos de error.
3. Servir documentación con Swagger UI (opcional) bajo `/docs`.

Ejemplo mínimo de esquema OpenAPI:

```yaml
openapi: 3.0.0
info:
  title: TaskFlow API
  version: 1.0.0
paths:
  /api/v1/health:
    get:
      responses:
        '200':
          description: OK
```

## Despliegue backend

### Local

```bash
cd server
npm install
npm run dev
```

### Vercel

El backend puede desplegarse en Vercel mediante función serverless:

`api/index.js`:

```js
const app = require('../src/app');
module.exports = app;
```

`vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/api/index.js" }]
}
```

Nota: en este proyecto también existe despliegue full-stack desde la raíz del repo con `vercel.json` principal, que enruta `/api/*` a `api/index.js`.
