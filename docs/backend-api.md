# Herramientas y ecosistema de APIs (backend y cliente)

Documento de referencia para **Fase D** y trabajo con APIs REST profesionales.

## Axios

**Qué es:** librería JavaScript muy usada para hacer peticiones HTTP desde el navegador o Node.js. Ofrece una API basada en promesas encima de `XMLHttpRequest` o `http`.

**Para qué sirve:** simplifica `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, adjuntar cabeceras, cuerpos JSON, interceptores (p. ej. añadir un token en todas las peticiones) y manejo centralizado de errores.

**Por qué se usa:** menos código repetitivo que `fetch` en algunos proyectos, cancelación de peticiones, timeouts configurables y soporte amplio en navegadores antiguos (según configuración). En TaskFlow el cliente usa **`fetch` nativo** en `src/api/client.js`, pero Axios es una alternativa equivalente muy habitual en equipos.

## Postman

**Qué es:** aplicación (y ecosistema en la nube) para diseñar, probar y documentar APIs HTTP.

**Para qué sirve:** enviar peticiones a endpoints con distintos métodos, cabeceras y cuerpos; guardar colecciones; automatizar pruebas; compartir entornos (variables `baseUrl`, tokens).

**Por qué se usa:** acelera el desarrollo backend sin escribir el frontend; permite reproducir errores (400, 404, 500) y validar contratos antes de integrar el cliente. En este repositorio hay una colección de ejemplo en `server/postman/TaskFlow-Fase-C.postman_collection.json`.

## Sentry

**Qué es:** plataforma de **monitoreo de errores** y rendimiento (APM) para aplicaciones frontend y backend.

**Para qué sirve:** captura excepciones no controladas, agrupa incidencias, muestra trazas (stack traces), contexto del usuario y releases; alertas cuando sube la tasa de fallos.

**Por qué se usa:** en producción los usuarios no abren la consola: Sentry permite detectar fallos reales, priorizar bugs y correlacionarlos con despliegues. Complementa los logs del servidor (`console.error` en Express) con visibilidad en cliente.

## Swagger (OpenAPI)

**Qué es:** conjunto de especificaciones y herramientas alrededor del estándar **OpenAPI** para describir APIs REST de forma declarativa (YAML/JSON).

**Para qué sirve:** generar documentación interactiva (Swagger UI), clientes SDK, validar requests/responses y alinear frontend y backend sobre un mismo contrato.

**Por qué se usa:** reduce ambigüedad (“¿este campo es obligatorio?”); facilita onboarding y pruebas sin leer solo el código fuente. TaskFlow puede evolucionar añadiendo un `openapi.yaml` que describa `/api/v1/tasks` y los códigos de error.

---

## Resumen

| Herramienta | Capa típica   | Rol principal                          |
|------------|----------------|----------------------------------------|
| Axios      | Cliente HTTP   | Peticiones y interceptores             |
| Postman    | Desarrollo/QA  | Pruebas manuales y colecciones         |
| Sentry     | Observabilidad | Errores y rendimiento en producción    |
| Swagger    | Contrato API   | Documentación y especificación OpenAPI |
