const { pool } = require('../config/database')

// Obtener todas las rutinas del usuario
const getRutinas = async (req, res) => {
  try {
    const userId = req.user.id

    const [rutinas] = await pool.execute(
      `SELECT 
        r.id,
        r.nombre,
        r.dia,
        r.grupo_muscular,
        r.creado_en,
        COUNT(re.id) as total_ejercicios,
        COUNT(ru.usuario_id) as usuarios_asignados
       FROM rutinas r
       LEFT JOIN rutinas_usuarios ru ON r.id = ru.rutina_id AND ru.usuario_id = ?
       LEFT JOIN rutina_ejercicios re ON r.id = re.rutina_id
       WHERE ru.usuario_id = ? OR r.id IN (
         SELECT rutina_id FROM rutinas_usuarios WHERE usuario_id = ?
       )
       GROUP BY r.id, r.nombre, r.dia, r.grupo_muscular, r.creado_en`,
      [userId, userId, userId]
    )

    res.json(rutinas)
  } catch (error) {
    console.error('Error obteniendo rutinas:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener ejercicios de una rutina
const getRutinaEjercicios = async (req, res) => {
  try {
    const { rutinaId } = req.params
    const userId = req.user.id

    // Verificar que la rutina pertenece al usuario
    const [rutinas] = await pool.execute(
      'SELECT r.id FROM rutinas r JOIN rutinas_usuarios ru ON r.id = ru.rutina_id WHERE r.id = ? AND ru.usuario_id = ?',
      [rutinaId, userId]
    )

    if (rutinas.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' })
    }

    const [ejercicios] = await pool.execute(
      `SELECT 
        e.id,
        e.nombre,
        e.descripcion,
        e.grupo_muscular,
        e.equipamiento,
        e.dificultad,
        re.ejercicio_id,
        re.series,
        re.repeticiones,
        re.peso_sugerido,
        re.descanso_segundos,
        re.notas,
        re.orden
       FROM rutina_ejercicios re
       JOIN ejercicios e ON re.ejercicio_id = e.id
       WHERE re.rutina_id = ?
       ORDER BY re.orden`,
      [rutinaId]
    )

    res.json(ejercicios)
  } catch (error) {
    console.error('Error obteniendo ejercicios de rutina:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Crear nueva rutina
const createRutina = async (req, res) => {
  try {
    const { nombre, dia, grupo_muscular, ejercicios } = req.body
    const userId = req.user.id

    if (!nombre || !dia || !grupo_muscular) {
      return res.status(400).json({ message: 'Nombre, día y grupo muscular son requeridos' })
    }

    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // Crear rutina
      const [rutinaResult] = await connection.execute(
        'INSERT INTO rutinas (nombre, dia, grupo_muscular) VALUES (?, ?, ?)',
        [nombre, dia, grupo_muscular]
      )

      const rutinaId = rutinaResult.insertId

      // Asignar rutina al usuario
      await connection.execute(
        'INSERT INTO rutinas_usuarios (rutina_id, usuario_id, fecha_asignacion) VALUES (?, ?, CURDATE())',
        [rutinaId, userId]
      )

      // Agregar ejercicios si se proporcionan
      if (ejercicios && ejercicios.length > 0) {
        for (let i = 0; i < ejercicios.length; i++) {
          const ejercicio = ejercicios[i]
          await connection.execute(
            'INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, series, reps_objetivo, orden) VALUES (?, ?, ?, ?, ?)',
            [rutinaId, ejercicio.ejercicio_id, ejercicio.series, ejercicio.reps_objetivo, i + 1]
          )
        }
      }

      await connection.commit()

      res.status(201).json({
        message: 'Rutina creada exitosamente',
        rutinaId
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error creando rutina:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Actualizar rutina
const updateRutina = async (req, res) => {
  try {
    const { rutinaId } = req.params
    const { nombre, dia, grupo_muscular } = req.body

    await pool.execute(
      'UPDATE rutinas SET nombre = ?, dia = ?, grupo_muscular = ? WHERE id = ?',
      [nombre, dia, grupo_muscular, rutinaId]
    )

    res.json({ message: 'Rutina actualizada exitosamente' })
  } catch (error) {
    console.error('Error actualizando rutina:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Eliminar rutina
const deleteRutina = async (req, res) => {
  try {
    const { rutinaId } = req.params
    const userId = req.user.id

    // Verificar que el usuario tiene acceso a esta rutina
    const [access] = await pool.execute(
      'SELECT id FROM rutinas_usuarios WHERE rutina_id = ? AND usuario_id = ?',
      [rutinaId, userId]
    )

    if (access.length === 0) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta rutina' })
    }

    await pool.execute('DELETE FROM rutinas WHERE id = ?', [rutinaId])

    res.json({ message: 'Rutina eliminada exitosamente' })
  } catch (error) {
    console.error('Error eliminando rutina:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener una rutina específica por ID
const getRutinaById = async (req, res) => {
  try {
    const userId = req.user.id
    const { rutinaId } = req.params

    const [rutinas] = await pool.execute(
      `SELECT 
        r.id,
        r.nombre,
        r.descripcion,
        r.dia,
        r.grupo_muscular,
        r.creado_en,
        r.notas,
        COUNT(re.id) as total_ejercicios
       FROM rutinas r
       LEFT JOIN rutinas_usuarios ru ON r.id = ru.rutina_id
       LEFT JOIN rutina_ejercicios re ON r.id = re.rutina_id
       WHERE r.id = ? AND ru.usuario_id = ?
       GROUP BY r.id, r.nombre, r.descripcion, r.dia, r.grupo_muscular, r.creado_en, r.notas`,
      [rutinaId, userId]
    )

    if (rutinas.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' })
    }

    res.json(rutinas[0])
  } catch (error) {
    console.error('Error obteniendo rutina:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Agregar ejercicio a rutina
const addEjercicioToRutina = async (req, res) => {
  try {
    const { rutinaId } = req.params
    const { ejercicio_id, series, repeticiones, peso_sugerido, descanso_segundos, notas } = req.body
    const userId = req.user.id

    // Verificar que la rutina pertenece al usuario
    const [rutinas] = await pool.execute(
      'SELECT r.id FROM rutinas r JOIN rutinas_usuarios ru ON r.id = ru.rutina_id WHERE r.id = ? AND ru.usuario_id = ?',
      [rutinaId, userId]
    )

    if (rutinas.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' })
    }

    // Obtener el siguiente orden
    const [maxOrden] = await pool.execute(
      'SELECT MAX(orden) as max_orden FROM rutina_ejercicios WHERE rutina_id = ?',
      [rutinaId]
    )

    const orden = (maxOrden[0].max_orden || 0) + 1

    // Agregar ejercicio
    await pool.execute(
      `INSERT INTO rutina_ejercicios 
       (rutina_id, ejercicio_id, series, repeticiones, peso_sugerido, descanso_segundos, notas, orden) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rutinaId, ejercicio_id, series, repeticiones, peso_sugerido, descanso_segundos, notas, orden]
    )

    res.status(201).json({ message: 'Ejercicio agregado exitosamente' })
  } catch (error) {
    console.error('Error agregando ejercicio:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Actualizar ejercicio de rutina
const updateEjercicioInRutina = async (req, res) => {
  try {
    const { rutinaId, ejercicioId } = req.params
    const { series, repeticiones, peso_sugerido, descanso_segundos, notas } = req.body
    const userId = req.user.id

    // Verificar que la rutina pertenece al usuario
    const [rutinas] = await pool.execute(
      'SELECT r.id FROM rutinas r JOIN rutinas_usuarios ru ON r.id = ru.rutina_id WHERE r.id = ? AND ru.usuario_id = ?',
      [rutinaId, userId]
    )

    if (rutinas.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' })
    }

    // Actualizar ejercicio
    const [result] = await pool.execute(
      `UPDATE rutina_ejercicios 
       SET series = ?, repeticiones = ?, peso_sugerido = ?, descanso_segundos = ?, notas = ?
       WHERE rutina_id = ? AND ejercicio_id = ?`,
      [series, repeticiones, peso_sugerido, descanso_segundos, notas, rutinaId, ejercicioId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ejercicio no encontrado en la rutina' })
    }

    res.json({ message: 'Ejercicio actualizado exitosamente' })
  } catch (error) {
    console.error('Error actualizando ejercicio:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Eliminar ejercicio de rutina
const removeEjercicioFromRutina = async (req, res) => {
  try {
    const { rutinaId, ejercicioId } = req.params
    const userId = req.user.id

    // Verificar que la rutina pertenece al usuario
    const [rutinas] = await pool.execute(
      'SELECT r.id FROM rutinas r JOIN rutinas_usuarios ru ON r.id = ru.rutina_id WHERE r.id = ? AND ru.usuario_id = ?',
      [rutinaId, userId]
    )

    if (rutinas.length === 0) {
      return res.status(404).json({ message: 'Rutina no encontrada' })
    }

    // Eliminar ejercicio
    const [result] = await pool.execute(
      'DELETE FROM rutina_ejercicios WHERE rutina_id = ? AND ejercicio_id = ?',
      [rutinaId, ejercicioId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ejercicio no encontrado en la rutina' })
    }

    res.json({ message: 'Ejercicio eliminado exitosamente' })
  } catch (error) {
    console.error('Error eliminando ejercicio:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

module.exports = {
  getRutinas,
  getRutinaById,
  getRutinaEjercicios,
  createRutina,
  updateRutina,
  deleteRutina,
  addEjercicioToRutina,
  updateEjercicioInRutina,
  removeEjercicioFromRutina
}
