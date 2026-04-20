import { calcularMedia, calcularMediana, filtrarAtipicos } from './math-utils.js';

const muestra = [2, 4, 4, 4, 5, 5, 7, 9, 100];
const vacia: number[] = [];

console.log('Muestra:', muestra);
console.log('Media:', calcularMedia(muestra));
console.log('Mediana:', calcularMediana(muestra));
console.log('Sin atípicos (±1.5·σ respecto a la media):', filtrarAtipicos(muestra, 1.5));

console.log('\nArray vacío:');
console.log('Media:', calcularMedia(vacia));
console.log('Mediana:', calcularMediana(vacia));
console.log('filtrarAtipicos:', filtrarAtipicos(vacia, 1.5));
