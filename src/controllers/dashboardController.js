const { pool } = require('../config/database')

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id

    // Total de entrenamientos del usuario
    const [totalEntrenamientos] = await pool.execute(
      'SELECT COUNT(*) as total FROM entrenamientos WHERE usuario_id = ?',
      [userId]
    )

    // Entrenamientos de esta semana
    const [entrenamientosSemana] = await pool.execute(
      `SELECT COUNT(*) as total FROM entrenamientos 
       WHERE usuario_id = ? AND YEARWEEK(fecha) = YEARWEEK(NOW())`,
      [userId]
    )

    // Rutinas activas del usuario
    const [rutinasActivas] = await pool.execute(
      `SELECT COUNT(DISTINCT r.id) as total 
       FROM rutinas r 
       JOIN rutinas_usuarios ru ON r.id = ru.id 
       WHERE ru.usuario_id = ?`,
      [userId]
    )

    // Total de ejercicios únicos realizados
    const [ejerciciosRealizados] = await pool.execute(
      `SELECT COUNT(DISTINCT ed.ejercicio_id) as total 
       FROM entrenamiento_detalles ed
       JOIN entrenamientos e ON ed.entrenamiento_id = e.id
       WHERE e.usuario_id = ?`,
      [userId]
    )

    res.json({
      totalEntrenamientos: totalEntrenamientos[0].total,
      entrenamientosSemana: entrenamientosSemana[0].total,
      rutinasActivas: rutinasActivas[0].total,
      ejerciciosRealizados: ejerciciosRealizados[0].total
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener entrenamientos recientes
const getRecentWorkouts = async (req, res) => {
  try {
    const userId = req.user.id

    const [workouts] = await pool.execute(
      `SELECT 
        e.id,
        r.nombre,
        e.fecha,
        COUNT(ed.id) as ejercicios,
        '45 min' as duracion
       FROM entrenamientos e
       JOIN rutinas r ON e.rutina_id = r.id
       LEFT JOIN entrenamiento_detalles ed ON e.id = ed.entrenamiento_id
       WHERE e.usuario_id = ?
       GROUP BY e.id, r.nombre, e.fecha
       ORDER BY e.fecha DESC
       LIMIT 5`,
      [userId]
    )

    res.json(workouts)
  } catch (error) {
    console.error('Error obteniendo entrenamientos recientes:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

module.exports = {
  getDashboardStats,
  getRecentWorkouts
}
