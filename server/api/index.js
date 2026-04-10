/**
 * Entrypoint serverless para Vercel.
 * Vercel invoca este handler como una función. Exportamos la app de Express.
 */
const app = require('../src/app');

module.exports = app;

