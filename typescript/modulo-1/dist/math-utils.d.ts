/**
 * Utilidades estadísticas con tipado estricto.
 * Casos límite: arrays vacíos → null donde corresponde.
 */
/** Media aritmética; devuelve null si no hay datos. */
export declare function calcularMedia(valores: readonly number[]): number | null;
/** Mediana; devuelve null si no hay datos. */
export declare function calcularMediana(valores: readonly number[]): number | null;
/**
 * Filtra valores atípicos conservando los que están dentro de `limite` desviaciones típicas
 * respecto a la media (criterio tipo z-score en muestra).
 * - `limite` debe ser > 0.
 * - Si la desviación típica es 0, se devuelve una copia del array (no hay dispersión).
 * - Array vacío → [].
 */
export declare function filtrarAtipicos(valores: readonly number[], limite: number): number[];
