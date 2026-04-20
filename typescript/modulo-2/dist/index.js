import { generarReporte } from './domain/reporte-matricula.js';
import { obtenerRecurso } from './services/api-client.js';
const asignaturas = [
    { id: 'asg-1', nombre: 'Programación I', creditos: 6, cursoAcademico: '2025/2026' },
    { id: 'asg-2', nombre: 'Bases de datos', creditos: 6, cursoAcademico: '2025/2026' }
];
const activa = { tipo: 'ACTIVA', asignaturas };
const suspendida = {
    tipo: 'SUSPENDIDA',
    motivo: 'Documentación pendiente de validación'
};
const finalizada = { tipo: 'FINALIZADA', notaMedia: 8.4 };
console.log(generarReporte(activa));
console.log(generarReporte(suspendida));
console.log(generarReporte(finalizada));
const resp = await obtenerRecurso('/estudiantes/demo');
console.log('\nRespuesta API simulada:', resp);
//# sourceMappingURL=index.js.map