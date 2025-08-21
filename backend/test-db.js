const { pool } = require('./src/config/database')

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    
    // Probar conexión
    const connection = await pool.getConnection()
    console.log('✅ Conexión a base de datos exitosa')
    
    // Probar consulta simple
    const [result] = await connection.execute('SELECT 1 as test')
    console.log('✅ Consulta de prueba exitosa:', result)
    
    // Verificar tablas
    const [tables] = await connection.execute("SHOW TABLES LIKE 'rutinas'")
    console.log('✅ Tabla rutinas encontrada:', tables.length > 0)
    
    const [users] = await connection.execute("SELECT COUNT(*) as count FROM users")
    console.log('✅ Usuarios en base de datos:', users[0].count)
    
    const [rutinas] = await connection.execute("SELECT COUNT(*) as count FROM rutinas")
    console.log('✅ Rutinas en base de datos:', rutinas[0].count)
    
    connection.release()
    
    console.log('🎉 Todas las pruebas pasaron correctamente')
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    process.exit(0)
  }
}

testConnection()
