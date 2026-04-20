/**
 * Simulación de acceso a datos remoto con promesas y tipado genérico.
 */
export interface RespuestaAPI<T> {
    readonly ok: boolean;
    readonly datos?: T;
    readonly error?: string;
}
/** Simula latencia de red + respuesta tipada. */
export declare function obtenerRecurso<T>(endpoint: string): Promise<RespuestaAPI<T>>;
