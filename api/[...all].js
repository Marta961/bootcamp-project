/**
 * Vercel Serverless Function (catch-all para /api/*) en la raíz del repo.
 * Permite desplegar frontend y backend en el mismo proyecto Vercel.
 */
const app = require('../server/src/app');

module.exports = app;

