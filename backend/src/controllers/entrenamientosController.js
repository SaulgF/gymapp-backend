const { pool } = require('../config/database')

// Obtener todos los entrenamientos del usuario
const getEntrenamientos = async (req, res) => {
  try {
    const userId = req.user.id

    const [entrenamientos] = await pool.execute(
      `SELECT 
        e.id,
        e.fecha,
        e.nota_general,
        r.nombre as rutina_nombre,
        r.grupo_muscular,
        COUNT(ed.id) as ejercicios_completados,
        AVG(CASE WHEN ed.reps_realizadas > 0 THEN 100 ELSE 0 END) as progreso
       FROM entrenamientos e
       JOIN rutinas r ON e.rutina_id = r.id
       LEFT JOIN entrenamiento_detalles ed ON e.id = ed.entrenamiento_id
       WHERE e.usuario_id = ?
       GROUP BY e.id, e.fecha, e.nota_general, r.nombre, r.grupo_muscular
       ORDER BY e.fecha DESC`,
      [userId]
    )

    // Obtener detalles de cada entrenamiento
    for (let entrenamiento of entrenamientos) {
      const [detalles] = await pool.execute(
        `SELECT 
          ed.reps_realizadas,
          ed.peso_usado,
          ed.nota,
          ej.nombre as ejercicio_nombre
         FROM entrenamiento_detalles ed
         JOIN ejercicios ej ON ed.ejercicio_id = ej.id
         WHERE ed.entrenamiento_id = ?`,
        [entrenamiento.id]
      )
      entrenamiento.detalles = detalles
    }

    res.json(entrenamientos)
  } catch (error) {
    console.error('Error obteniendo entrenamientos:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener entrenamiento por ID
const getEntrenamientoById = async (req, res) => {
  try {
    const { entrenamientoId } = req.params
    const userId = req.user.id

    const [entrenamientos] = await pool.execute(
      `SELECT 
        e.id,
        e.fecha,
        e.nota_general,
        r.nombre as rutina_nombre,
        r.grupo_muscular
       FROM entrenamientos e
       JOIN rutinas r ON e.rutina_id = r.id
       WHERE e.id = ? AND e.usuario_id = ?`,
      [entrenamientoId, userId]
    )

    if (entrenamientos.length === 0) {
      return res.status(404).json({ message: 'Entrenamiento no encontrado' })
    }

    const entrenamiento = entrenamientos[0]

    // Obtener detalles del entrenamiento
    const [detalles] = await pool.execute(
      `SELECT 
        ed.id,
        ed.reps_realizadas,
        ed.peso_usado,
        ed.nota,
        ej.nombre as ejercicio_nombre,
        ej.grupo_muscular
       FROM entrenamiento_detalles ed
       JOIN ejercicios ej ON ed.ejercicio_id = ej.id
       WHERE ed.entrenamiento_id = ?`,
      [entrenamientoId]
    )

    entrenamiento.detalles = detalles

    res.json(entrenamiento)
  } catch (error) {
    console.error('Error obteniendo entrenamiento:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Crear nuevo entrenamiento
const createEntrenamiento = async (req, res) => {
  try {
  const { rutina_id, fecha_inicio } = req.body
  // Usar solo YYYY-MM-DD del string recibido para MySQL DATE
  const fechaMysql = fecha_inicio ? fecha_inicio.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const userId = req.user.id

    console.log('Creating entrenamiento with:', { rutina_id, fecha_inicio, userId })

    if (!rutina_id || !fecha_inicio) {
      return res.status(400).json({ message: 'Rutina y fecha de inicio son requeridos' })
    }

    // Verificar que la rutina existe y pertenece al usuario
    const [rutinas] = await pool.execute(
      'SELECT r.id FROM rutinas r JOIN rutinas_usuarios ru ON r.id = ru.rutina_id WHERE r.id = ? AND ru.usuario_id = ?',
      [rutina_id, userId]
    )

    if (rutinas.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' })
    }

    // Crear entrenamiento
    const [result] = await pool.execute(
      'INSERT INTO entrenamientos (usuario_id, rutina_id, fecha, fecha_inicio) VALUES (?, ?, ?, ?)',
      [userId, rutina_id, fechaMysql, fechaMysql]
    )

    const entrenamiento = {
      id: result.insertId,
      usuario_id: userId,
      rutina_id: parseInt(rutina_id),
      fecha: fechaMysql,
      fecha_inicio: fechaMysql,
      fecha_fin: null,
      nota_general: null
    }

    console.log('Entrenamiento created:', entrenamiento)
    res.status(201).json(entrenamiento)
  } catch (error) {
    console.error('Error creando entrenamiento:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Actualizar entrenamiento (finalizar)
const updateEntrenamiento = async (req, res) => {
  try {
    const { entrenamientoId } = req.params
    const { fecha_fin, notas_generales } = req.body
    const userId = req.user.id

    console.log('Updating entrenamiento:', { entrenamientoId, fecha_fin, notas_generales, userId })

    // Verificar que el entrenamiento pertenece al usuario
    const [access] = await pool.execute(
      'SELECT id FROM entrenamientos WHERE id = ? AND usuario_id = ?',
      [entrenamientoId, userId]
    )

    if (access.length === 0) {
      return res.status(404).json({ message: 'Entrenamiento no encontrado' })
    }

    // Actualizar entrenamiento
    await pool.execute(
      'UPDATE entrenamientos SET fecha_fin = ?, nota_general = ? WHERE id = ?',
      [fecha_fin, notas_generales || null, entrenamientoId]
    )

    res.json({ message: 'Entrenamiento finalizado exitosamente' })
  } catch (error) {
    console.error('Error finalizando entrenamiento:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Eliminar entrenamiento
const deleteEntrenamiento = async (req, res) => {
  try {
    const { entrenamientoId } = req.params
    const userId = req.user.id

    // Verificar que el entrenamiento pertenece al usuario
    const [access] = await pool.execute(
      'SELECT id FROM entrenamientos WHERE id = ? AND usuario_id = ?',
      [entrenamientoId, userId]
    )

    if (access.length === 0) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este entrenamiento' })
    }

    await pool.execute('DELETE FROM entrenamientos WHERE id = ?', [entrenamientoId])

    res.json({ message: 'Entrenamiento eliminado exitosamente' })
  } catch (error) {
    console.error('Error eliminando entrenamiento:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Crear detalle de entrenamiento (serie)
const createEntrenamientoDetalle = async (req, res) => {
  try {
    const { entrenamiento_id, ejercicio_id, serie_numero, repeticiones, peso, notas } = req.body
    const userId = req.user.id

    // Verificar que el entrenamiento pertenece al usuario
    const [entrenamientos] = await pool.execute(
      'SELECT id FROM entrenamientos WHERE id = ? AND usuario_id = ?',
      [entrenamiento_id, userId]
    )

    if (entrenamientos.length === 0) {
      return res.status(404).json({ message: 'Entrenamiento no encontrado' })
    }

    // Crear detalle
    const [result] = await pool.execute(
      'INSERT INTO entrenamiento_detalles (entrenamiento_id, ejercicio_id, serie_numero, reps_realizadas, peso_usado, notas) VALUES (?, ?, ?, ?, ?, ?)',
      [entrenamiento_id, ejercicio_id, serie_numero, repeticiones, peso, notas]
    )

    const detalle = {
      id: result.insertId,
      entrenamiento_id,
      ejercicio_id,
      serie_numero,
      repeticiones,
      peso,
      notas
    }

    res.status(201).json(detalle)
  } catch (error) {
    console.error('Error creando detalle de entrenamiento:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

module.exports = {
  getEntrenamientos,
  getEntrenamientoById,
  createEntrenamiento,
  updateEntrenamiento,
  deleteEntrenamiento,
  createEntrenamientoDetalle
}
