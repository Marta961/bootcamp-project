# Modelo de datos — Sistema universitario (Módulo 2)

## Entidades principales

### `Estudiante`

Se modela como `interface` porque describe un **objeto plano** con propiedades públicas y se espera compatibilidad con objetos literales JSON. El identificador es `readonly` para impedir reasignaciones accidentales en runtime (TypeScript lo marca en compilación).

### `Asignatura`

Misma decisión: `interface` para un contrato claro y extensible. `readonly id` por la misma razón que en estudiante.

## Unión discriminada `EstadoMatricula`

Se usa `type` (alias) para componer **tres interfaces mutuamente excluyentes** unidas por la propiedad literal `tipo`:

- `MatriculaActiva` con `tipo: "ACTIVA"` y lista de asignaturas.
- `MatriculaSuspendida` con `tipo: "SUSPENDIDA"` y `motivo`.
- `MatriculaFinalizada` con `tipo: "FINALIZADA"` y `notaMedia`.

Esta forma permite que TypeScript **estreche** el tipo en un `switch (estado.tipo)` sin casts manuales.

## `generarReporte`

La función consume `EstadoMatricula` y usa `switch` exhaustivo. En el `default` se usa `never` vía `assertNever` para garantizar que, si se añade un nuevo estado, el compilador obligará a actualizar el `switch`.

## Cliente API genérico

`RespuestaAPI<T>` modela el envoltorio típico de una API REST:

- `ok` discrimina éxito/error sin ambigüedad.
- `datos` opcional solo cuando `ok` es verdadero.
- `error` opcional cuando `ok` es falso.

`obtenerRecurso<T>` devuelve `Promise<RespuestaAPI<T>>` para **reutilizar** la misma forma de respuesta con distintos `T`, evitando duplicar funciones por recurso y manteniendo el tipado en el sitio de llamada.

## ¿Interface vs type?

- **`interface`**: contratos de objetos que pueden extenderse y suelen mapear bien a datos JSON.
- **`type`**: excelente para uniones, intersecciones y utilidades (`Partial`, `Pick`, etc.).
