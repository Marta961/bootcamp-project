const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// GET /api/v1/tasks
router.get('/', taskController.obtenerTareas);

// POST /api/v1/tasks
router.post('/', taskController.crearTarea);

// DELETE /api/v1/tasks/:id
router.delete('/:id', taskController.eliminarTarea);

// PATCH /api/v1/tasks/:id/complete (antes de /:id)
router.patch('/:id/complete', taskController.completarTarea);

// PATCH /api/v1/tasks/:id
router.patch('/:id', taskController.patchTarea);

module.exports = router;
