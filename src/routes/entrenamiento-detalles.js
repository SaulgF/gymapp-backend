const express = require('express')
const router = express.Router()
const entrenamientosController = require('../controllers/entrenamientosController')
const { authenticateToken } = require('../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.post('/', entrenamientosController.createEntrenamientoDetalle)

module.exports = router
