# Herramientas y ecosistema de APIs (backend y cliente)

Documento de referencia para **Fase D** y trabajo con APIs REST profesionales.

## Axios
- Definición: librería JavaScript para hacer peticiones HTTP desde el navegador o Node.js que ofrece una API basada en promesas encima de `XMLHttpRequest` o `http`.
- Para qué sirve: simplifica `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, adjuntar cabeceras, cuerpos JSON, interceptores (p. ej. añadir un token en todas las peticiones) y manejo centralizado de errores.
- Beneficios: se usa menos código repetitivo que `fetch`, cancelación de peticiones y timeouts configurables. 

## Postman
- Definición: aplicación y ecosistema en la nube para diseñar, probar y documentar APIs HTTP.
- Usos: guarda colecciones, automatiza pruebas y envia peticiones a endpoints con distintos métodos, cabeceras y cuerpos.
- Beneficios: acelera el desarrollo backend sin necesidad de escribir el frontend, permite reproducir errores (400, 404, 500) y validar contratos antes de integrar el cliente. En este caso sería en `server/postman/TaskFlow-Fase-C.postman_collection.json`.

## Sentry
- Definición: plataforma de monitoreo de errores y rendimiento (APM) para aplicaciones frontend y backend.
- Usos: captura excepciones no controladas,  alertas cuando sube la tasa de fallos, agrupa incidencias, y muestra trazas (stack traces), contexto del usuario y releases.

## Swagger (OpenAPI)
- Definición: conjunto de especificaciones y herramientas alrededor del estándar OpenAPI para describir APIs REST de forma declarativa (YAML/JSON).
- Usos: generar documentación interactiva (Swagger UI), clientes SDK, validar requests/responses y alinear frontend y backend sobre un mismo contrato.
- Beneficios: reduce ambigüedad, facilita onboarding y pruebas sin leer solo el código fuente. 

## Resumen

| Herramienta | Capa típica    | Rol principal                          |
|-------------|----------------|----------------------------------------|
| Axios       | Cliente HTTP   | Peticiones e interceptores             |
| Postman     | Desarrollo/QA  | Pruebas manuales y colecciones         |
| Sentry      | Observabilidad | Errores y rendimiento en producción    |
| Swagger     | Contrato API   | Documentación y especificación OpenAPI |
