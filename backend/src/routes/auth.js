const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

// Rutas públicas
router.post('/login', authController.login)

// Rutas protegidas
router.get('/me', authenticateToken, authController.getMe)

// Rutas de admin
router.post('/register', authenticateToken, requireAdmin, authController.register)

module.exports = router
