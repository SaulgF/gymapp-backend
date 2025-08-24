const express = require('express')
const router = express.Router()
const ejerciciosController = require('../controllers/ejerciciosController')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Rutas públicas para usuarios autenticados
router.get('/', ejerciciosController.getEjercicios)
router.get('/grupo/:grupo', ejerciciosController.getEjerciciosByGrupo)
router.get('/:ejercicioId', ejerciciosController.getEjercicioById)

// Rutas que requieren permisos de admin
router.post('/', requireAdmin, ejerciciosController.createEjercicio)
router.put('/:ejercicioId', requireAdmin, ejerciciosController.updateEjercicio)
router.delete('/:ejercicioId', requireAdmin, ejerciciosController.deleteEjercicio)

module.exports = router
