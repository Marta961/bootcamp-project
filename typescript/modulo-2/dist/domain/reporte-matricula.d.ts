import type { EstadoMatricula } from './types/estado-matricula.js';
/**
 * Genera un texto descriptivo según el estado de matrícula.
 * Análisis exhaustivo: el `default` usa `never` para forzar actualizar el switch
 * si se añade un nuevo literal al union.
 */
export declare function generarReporte(estado: EstadoMatricula): string;
