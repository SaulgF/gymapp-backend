const mysql = require('mysql2/promise')
// dotenv eliminado, solo Railway/envs

// Validar variables de entorno obligatorias
const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length) {
  throw new Error('Faltan variables de entorno para la base de datos: ' + missingVars.join(', '));
}

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
}

const pool = mysql.createPool(dbConfig)

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Conexión a MySQL establecida exitosamente')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message)
    console.error('❌ variables de entorno:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME
    })
    return false
  }
}

module.exports = {
  pool,
  testConnection
}
