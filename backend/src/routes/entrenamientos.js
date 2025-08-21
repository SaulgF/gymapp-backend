const express = require('express')
const router = express.Router()
const entrenamientosController = require('../controllers/entrenamientosController')
const { authenticateToken } = require('../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.get('/', entrenamientosController.getEntrenamientos)
router.get('/:entrenamientoId', entrenamientosController.getEntrenamientoById)
router.post('/', entrenamientosController.createEntrenamiento)
router.put('/:entrenamientoId', entrenamientosController.updateEntrenamiento)
router.delete('/:entrenamientoId', entrenamientosController.deleteEntrenamiento)

module.exports = router
