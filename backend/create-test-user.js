const bcrypt = require('bcryptjs')
const { pool } = require('./src/config/database')

async function createTestUser() {
  try {
    // Conectar a la base de datos
    console.log('🔗 Conectando a la base de datos...')
    
    // Hashear la contraseña
    const password = 'password123'
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Insertar usuario de prueba
    const [result] = await pool.execute(
      'INSERT INTO users (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      ['Usuario Demo', 'demo@gym.com', passwordHash, 'user']
    )
    
    console.log('✅ Usuario de prueba creado exitosamente!')
    console.log('📧 Email: demo@gym.com')
    console.log('🔑 Contraseña: password123')
    console.log('🆔 ID de usuario:', result.insertId)
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  El usuario de prueba ya existe')
      console.log('📧 Email: demo@gym.com')
      console.log('🔑 Contraseña: password123')
    } else {
      console.error('❌ Error creando usuario:', error.message)
    }
  } finally {
    process.exit(0)
  }
}

createTestUser()
