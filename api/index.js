/**
 * Entrypoint serverless principal para Vercel desde la raíz del proyecto.
 * Se usa junto con vercel.json para enrutar /api/* a esta función.
 */
const app = require('../server/src/app');

module.exports = app;

