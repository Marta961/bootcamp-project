function assertNever(valor) {
    throw new Error(`Estado de matrícula no contemplado: ${JSON.stringify(valor)}`);
}
/**
 * Genera un texto descriptivo según el estado de matrícula.
 * Análisis exhaustivo: el `default` usa `never` para forzar actualizar el switch
 * si se añade un nuevo literal al union.
 */
export function generarReporte(estado) {
    switch (estado.tipo) {
        case 'ACTIVA': {
            const n = estado.asignaturas.length;
            return `Matrícula activa con ${n} asignatura(s) cursadas o planificadas.`;
        }
        case 'SUSPENDIDA':
            return `Matrícula suspendida. Motivo: ${estado.motivo}`;
        case 'FINALIZADA':
            return `Matrícula finalizada. Nota media: ${estado.notaMedia.toFixed(2)}`;
        default:
            return assertNever(estado);
    }
}
//# sourceMappingURL=reporte-matricula.js.map