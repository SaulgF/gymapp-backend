const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/database')

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' })
    }

    // Buscar usuario por email
    const [users] = await pool.execute(
      'SELECT id, nombre, email, password_hash, rol FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const user = users[0]

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Remover password del objeto usuario
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener información del usuario actual
const getMe = async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Registro (solo para admins)
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol = 'user' } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    // Verificar si el email ya existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    // Hashear contraseña
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Crear usuario
    const [result] = await pool.execute(
      'INSERT INTO users (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, passwordHash, rol]
    )

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId: result.insertId
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

module.exports = {
  login,
  getMe,
  register
}
