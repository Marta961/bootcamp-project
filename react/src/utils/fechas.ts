import { differenceInDays } from 'date-fns';

/**
 * Diferencia en días entre dos fechas (inclusive del orden temporal).
 * Tipos estrictos: ambas entradas son `Date` y la salida es `number` entero ≥ 0.
 */
export function diasEntreFechas(inicio: Date, fin: Date): number {
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new Error('Las fechas deben ser válidas');
  }
  if (fin < inicio) {
    throw new Error('La fecha fin debe ser posterior o igual a la fecha inicio');
  }
  return differenceInDays(fin, inicio);
}
