const { pool } = require('../config/database')

// Obtener todos los ejercicios
const getEjercicios = async (req, res) => {
  try {
    const [ejercicios] = await pool.execute(
      'SELECT id, nombre, grupo_muscular, video_url, creado_en FROM ejercicios ORDER BY grupo_muscular, nombre'
    )

    res.json(ejercicios)
  } catch (error) {
    console.error('Error obteniendo ejercicios:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener ejercicio por ID
const getEjercicioById = async (req, res) => {
  try {
    const { ejercicioId } = req.params

    const [ejercicios] = await pool.execute(
      'SELECT id, nombre, grupo_muscular, video_url, creado_en FROM ejercicios WHERE id = ?',
      [ejercicioId]
    )

    if (ejercicios.length === 0) {
      return res.status(404).json({ message: 'Ejercicio no encontrado' })
    }

    res.json(ejercicios[0])
  } catch (error) {
    console.error('Error obteniendo ejercicio:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Crear nuevo ejercicio
const createEjercicio = async (req, res) => {
  try {
    const { nombre, grupo_muscular, video_url } = req.body

    if (!nombre || !grupo_muscular) {
      return res.status(400).json({ message: 'Nombre y grupo muscular son requeridos' })
    }

    const [result] = await pool.execute(
      'INSERT INTO ejercicios (nombre, grupo_muscular, video_url) VALUES (?, ?, ?)',
      [nombre, grupo_muscular, video_url || null]
    )

    res.status(201).json({
      message: 'Ejercicio creado exitosamente',
      ejercicioId: result.insertId
    })
  } catch (error) {
    console.error('Error creando ejercicio:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Actualizar ejercicio
const updateEjercicio = async (req, res) => {
  try {
    const { ejercicioId } = req.params
    const { nombre, grupo_muscular, video_url } = req.body

    if (!nombre || !grupo_muscular) {
      return res.status(400).json({ message: 'Nombre y grupo muscular son requeridos' })
    }

    const [result] = await pool.execute(
      'UPDATE ejercicios SET nombre = ?, grupo_muscular = ?, video_url = ? WHERE id = ?',
      [nombre, grupo_muscular, video_url || null, ejercicioId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ejercicio no encontrado' })
    }

    res.json({ message: 'Ejercicio actualizado exitosamente' })
  } catch (error) {
    console.error('Error actualizando ejercicio:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Eliminar ejercicio
const deleteEjercicio = async (req, res) => {
  try {
    const { ejercicioId } = req.params

    // Verificar si el ejercicio está siendo usado en rutinas
    const [usage] = await pool.execute(
      'SELECT COUNT(*) as count FROM rutina_ejercicios WHERE ejercicio_id = ?',
      [ejercicioId]
    )

    if (usage[0].count > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el ejercicio porque está siendo usado en rutinas activas' 
      })
    }

    const [result] = await pool.execute(
      'DELETE FROM ejercicios WHERE id = ?',
      [ejercicioId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ejercicio no encontrado' })
    }

    res.json({ message: 'Ejercicio eliminado exitosamente' })
  } catch (error) {
    console.error('Error eliminando ejercicio:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener ejercicios por grupo muscular
const getEjerciciosByGrupo = async (req, res) => {
  try {
    const { grupo } = req.params

    const [ejercicios] = await pool.execute(
      'SELECT id, nombre, grupo_muscular, video_url FROM ejercicios WHERE grupo_muscular = ? ORDER BY nombre',
      [grupo]
    )

    res.json(ejercicios)
  } catch (error) {
    console.error('Error obteniendo ejercicios por grupo:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

module.exports = {
  getEjercicios,
  getEjercicioById,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio,
  getEjerciciosByGrupo
}
