const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const { authenticateToken } = require('../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticateToken)

router.get('/stats', dashboardController.getDashboardStats)
router.get('/recent-workouts', dashboardController.getRecentWorkouts)

module.exports = router
