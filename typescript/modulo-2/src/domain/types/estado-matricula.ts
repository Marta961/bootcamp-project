import type { Asignatura } from './asignatura.js';

export interface MatriculaActiva {
  readonly tipo: 'ACTIVA';
  asignaturas: ReadonlyArray<Asignatura>;
}

export interface MatriculaSuspendida {
  readonly tipo: 'SUSPENDIDA';
  motivo: string;
}

export interface MatriculaFinalizada {
  readonly tipo: 'FINALIZADA';
  notaMedia: number;
}

export type EstadoMatricula = MatriculaActiva | MatriculaSuspendida | MatriculaFinalizada;
