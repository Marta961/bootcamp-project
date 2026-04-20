/**
 * Utilidades estadísticas con tipado estricto.
 * Casos límite: arrays vacíos → null donde corresponde.
 */

function suma(valores: readonly number[]): number {
  return valores.reduce((acc, v) => acc + v, 0);
}

/** Media aritmética; devuelve null si no hay datos. */
export function calcularMedia(valores: readonly number[]): number | null {
  if (valores.length === 0) return null;
  return suma(valores) / valores.length;
}

function ordenarCopia(valores: readonly number[]): number[] {
  return [...valores].sort((a, b) => a - b);
}

/** Mediana; devuelve null si no hay datos. */
export function calcularMediana(valores: readonly number[]): number | null {
  if (valores.length === 0) return null;
  const ordenados = ordenarCopia(valores);
  const mitad = Math.floor(ordenados.length / 2);
  if (ordenados.length % 2 === 1) {
    return ordenados[mitad]!;
  }
  const a = ordenados[mitad - 1]!;
  const b = ordenados[mitad]!;
  return (a + b) / 2;
}

function desviacionTipicaMuestral(valores: readonly number[], media: number): number {
  if (valores.length <= 1) return 0;
  const varianza =
    valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / (valores.length - 1);
  return Math.sqrt(varianza);
}

/**
 * Filtra valores atípicos conservando los que están dentro de `limite` desviaciones típicas
 * respecto a la media (criterio tipo z-score en muestra).
 * - `limite` debe ser > 0.
 * - Si la desviación típica es 0, se devuelve una copia del array (no hay dispersión).
 * - Array vacío → [].
 */
export function filtrarAtipicos(valores: readonly number[], limite: number): number[] {
  if (valores.length === 0) return [];
  if (limite <= 0) {
    throw new Error('limite debe ser un número positivo');
  }
  const media = calcularMedia(valores);
  if (media === null) return [];
  const sigma = desviacionTipicaMuestral(valores, media);
  if (sigma === 0) {
    return [...valores];
  }
  return valores.filter((v) => Math.abs(v - media) <= limite * sigma);
}
