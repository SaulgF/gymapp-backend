const express = require('express')
const router = express.Router()
const rutinasController = require('../controllers/rutinasController')
const { authenticateToken } = require('../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.get('/', rutinasController.getRutinas)
router.get('/:rutinaId/ejercicios', rutinasController.getRutinaEjercicios)
router.post('/:rutinaId/ejercicios', rutinasController.addEjercicioToRutina)
router.put('/:rutinaId/ejercicios/:ejercicioId', rutinasController.updateEjercicioInRutina)
router.delete('/:rutinaId/ejercicios/:ejercicioId', rutinasController.removeEjercicioFromRutina)
router.get('/:rutinaId', rutinasController.getRutinaById)
router.post('/', rutinasController.createRutina)
router.put('/:rutinaId', rutinasController.updateRutina)
router.delete('/:rutinaId', rutinasController.deleteRutina)

module.exports = router
