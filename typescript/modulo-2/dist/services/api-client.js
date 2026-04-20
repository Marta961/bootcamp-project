/**
 * Simulación de acceso a datos remoto con promesas y tipado genérico.
 */
function esperar(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
/** Simula latencia de red + respuesta tipada. */
export async function obtenerRecurso(endpoint) {
    await esperar(120 + Math.floor(Math.random() * 80));
    if (!endpoint.startsWith('/')) {
        return { ok: false, error: 'El endpoint debe comenzar por /' };
    }
    // Simulación mínima: el caller hace cast del tipo esperado en capas superiores.
    // Aquí devolvemos ok:true con datos undefined para rutas no mapeadas (evita mentir con tipos).
    if (endpoint === '/estudiantes/demo') {
        const datos = {
            id: 'est-001',
            nombre: 'Ana',
            apellidos: 'García López',
            email: 'ana.garcia@uni.example'
        };
        return { ok: true, datos };
    }
    return { ok: false, error: `Recurso no simulado: ${endpoint}` };
}
//# sourceMappingURL=api-client.js.map