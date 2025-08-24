const mysql = require('mysql2/promise')
// dotenv eliminado, solo Railway envs

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
    return false
  }
}

module.exports = {
  pool,
  testConnection
}
