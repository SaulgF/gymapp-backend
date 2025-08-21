const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const { testConnection } = require('./config/database')

// Importar rutas
const authRoutes = require('./routes/auth')
const dashboardRoutes = require('./routes/dashboard')
const rutinasRoutes = require('./routes/rutinas')
const ejerciciosRoutes = require('./routes/ejercicios')
const entrenamientosRoutes = require('./routes/entrenamientos')
const entrenamientoDetallesRoutes = require('./routes/entrenamiento-detalles')

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares de seguridad
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
  message: 'Demasiadas peticiones desde esta IP, intenta nuevamente en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// CORS - Configuración para desarrollo local y acceso móvil
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tudominio.com'] 
    : function (origin, callback) {
        // Permitir requests sin origin (ej: aplicaciones móviles)
        if (!origin) return callback(null, true)
        
        // Lista de orígenes permitidos
        const allowedOrigins = [
          'http://localhost:5173', 
          'http://localhost:5174', 
          'http://localhost:5175',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174', 
          'http://127.0.0.1:5175',
          'http://192.168.1.3:5173',
          'http://192.168.1.3:5174',
          'http://192.168.1.3:5175'
        ]
        
        // Permitir cualquier IP en la red local 192.168.1.x en puertos 5173-5175
        const localNetworkRegex = /^http:\/\/192\.168\.1\.\d{1,3}:(5173|5174|5175)$/
        
        if (allowedOrigins.includes(origin) || localNetworkRegex.test(origin)) {
          callback(null, true)
        } else {
          console.log('❌ CORS blocked origin:', origin)
          callback(new Error('No permitido por CORS'))
        }
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/rutinas', rutinasRoutes)
app.use('/api/ejercicios', ejerciciosRoutes)
app.use('/api/entrenamientos', entrenamientosRoutes)
app.use('/api/entrenamiento-detalles', entrenamientoDetallesRoutes)

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Ruta para información de la API
app.get('/api', (req, res) => {
  res.json({
    name: 'GymApp API',
    version: '1.0.0',
    description: 'API REST para la aplicación de gimnasio',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      rutinas: '/api/rutinas',
      ejercicios: '/api/ejercicios',
      entrenamientos: '/api/entrenamientos'
    }
  })
})

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    path: req.originalUrl
  })
})

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error)
  
  res.status(error.status || 500).json({
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection()
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos')
      process.exit(1)
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
      console.log(`📱 API disponible en: http://localhost:${PORT}/api`)
      console.log(`🌐 Acceso desde red: http://192.168.1.3:${PORT}/api`)
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error)
    process.exit(1)
  }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('👋 Recibida señal SIGTERM, cerrando servidor...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('👋 Recibida señal SIGINT, cerrando servidor...')
  process.exit(0)
})

startServer()
