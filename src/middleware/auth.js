const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Verificar que el usuario aún existe
    const [users] = await pool.execute(
      'SELECT id, nombre, email, rol FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuario no válido' })
    }

    req.user = users[0]
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token no válido' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido a administradores' })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireAdmin
}
