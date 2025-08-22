import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import api from '../services/api'

const EditarEjercicio = () => {
  const { rutinaId, ejercicioId } = useParams()
  const navigate = useNavigate()
  const [ejercicio, setEjercicio] = useState(null)
  const [rutina, setRutina] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [config, setConfig] = useState({
    series: '',
    repeticiones: '',
    peso_sugerido: '',
    descanso_segundos: '',
    notas: ''
  })

  useEffect(() => {
    fetchData()
  }, [rutinaId, ejercicioId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rutinaRes, ejerciciosRes] = await Promise.all([
        api.get(`/rutinas/${rutinaId}`),
        api.get(`/rutinas/${rutinaId}/ejercicios`)
      ])
      
      setRutina(rutinaRes.data)
      
      // Buscar el ejercicio específico
      const ejercicioEncontrado = ejerciciosRes.data.find(
        ej => ej.ejercicio_id.toString() === ejercicioId
      )
      
      if (!ejercicioEncontrado) {
        setError('Ejercicio no encontrado en esta rutina')
        return
      }

      setEjercicio(ejercicioEncontrado)
      setConfig({
        series: ejercicioEncontrado.series || '',
        repeticiones: ejercicioEncontrado.repeticiones || '',
        peso_sugerido: ejercicioEncontrado.peso_sugerido || '',
        descanso_segundos: ejercicioEncontrado.descanso_segundos || '',
        notas: ejercicioEncontrado.notas || ''
      })
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError('Error al cargar los datos del ejercicio')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      // Validaciones
      if (!config.series || config.series < 1) {
        setError('Las series deben ser al menos 1')
        return
      }
      if (!config.repeticiones || config.repeticiones < 1) {
        setError('Las repeticiones deben ser al menos 1')
        return
      }
      if (!config.descanso_segundos || config.descanso_segundos < 0) {
        setError('El tiempo de descanso debe ser 0 o mayor')
        return
      }

      await api.put(`/rutinas/${rutinaId}/ejercicios/${ejercicioId}`, {
        series: parseInt(config.series),
        repeticiones: parseInt(config.repeticiones),
        peso_sugerido: config.peso_sugerido || null,
        descanso_segundos: parseInt(config.descanso_segundos),
        notas: config.notas
      })

      navigate(`/rutinas/${rutinaId}`)
    } catch (error) {
      console.error('Error guardando ejercicio:', error)
      setError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/rutinas/${rutinaId}/ejercicios/${ejercicioId}`)
      navigate(`/rutinas/${rutinaId}`)
    } catch (error) {
      console.error('Error eliminando ejercicio:', error)
      setError('Error al eliminar el ejercicio')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white text-lg">Cargando ejercicio...</div>
      </div>
    )
  }

  if (error && !ejercicio) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/rutinas/${rutinaId}`)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Error</h1>
        </div>
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/rutinas/${rutinaId}`)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Editar Ejercicio</h1>
            <p className="text-gray-400 mt-1">
              {ejercicio?.nombre} - {rutina?.nombre}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Eliminar</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Información del ejercicio */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Información del Ejercicio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Grupo muscular:</span>
            <p className="text-white">{ejercicio?.grupo_muscular}</p>
          </div>
          <div>
            <span className="text-gray-400">Equipamiento:</span>
            <p className="text-white">{ejercicio?.equipamiento}</p>
          </div>
          <div>
            <span className="text-gray-400">Dificultad:</span>
            <p className="text-white capitalize">{ejercicio?.dificultad}</p>
          </div>
        </div>
        {ejercicio?.descripcion && (
          <div className="mt-4">
            <span className="text-gray-400 text-sm">Descripción:</span>
            <p className="text-white mt-1">{ejercicio.descripcion}</p>
          </div>
        )}
      </div>

      {/* Formulario de configuración */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Configuración del Ejercicio</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Series *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.series}
                onChange={(e) => setConfig({...config, series: e.target.value})}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Repeticiones *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.repeticiones}
                onChange={(e) => setConfig({...config, repeticiones: e.target.value})}
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Peso sugerido (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={config.peso_sugerido}
                onChange={(e) => setConfig({...config, peso_sugerido: e.target.value})}
                className="input-field w-full"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descanso (segundos) *
              </label>
              <input
                type="number"
                min="0"
                max="600"
                step="15"
                value={config.descanso_segundos}
                onChange={(e) => setConfig({...config, descanso_segundos: e.target.value})}
                className="input-field w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo de descanso entre series
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              value={config.notas}
              onChange={(e) => setConfig({...config, notas: e.target.value})}
              className="input-field w-full resize-none"
              rows="3"
              placeholder="Instrucciones especiales, técnica, etc..."
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => navigate(`/rutinas/${rutinaId}`)}
            className="btn-secondary flex-1"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar "{ejercicio?.nombre}" de esta rutina?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex-1 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditarEjercicio
