import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit3, Trash2, Clock, Dumbbell } from 'lucide-react'
import api from '../services/api'

const RutinaDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rutina, setRutina] = useState(null)
  const [ejercicios, setEjercicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRutinaDetalle()
  }, [id])

  const fetchRutinaDetalle = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Fetching rutina with ID:', id)
      
      // Obtener información de la rutina
      const rutinaResponse = await api.get(`/rutinas/${id}`)
      console.log('Rutina response:', rutinaResponse.data)
      setRutina(rutinaResponse.data)

      // Obtener ejercicios de la rutina
      const ejerciciosResponse = await api.get(`/rutinas/${id}/ejercicios`)
      console.log('Ejercicios response:', ejerciciosResponse.data)
      setEjercicios(ejerciciosResponse.data)
    } catch (error) {
      console.error('Error obteniendo detalles de rutina:', error)
      console.error('Error response:', error.response)
      
      if (error.response) {
        setError(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`)
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.')
      } else {
        setError('Error al cargar los detalles de la rutina')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarEjercicio = async (ejercicioId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ejercicio de la rutina?')) {
      try {
        await api.delete(`/rutinas/${id}/ejercicios/${ejercicioId}`)
        setEjercicios(ejercicios.filter(ej => ej.ejercicio_id !== ejercicioId))
      } catch (error) {
        console.error('Error eliminando ejercicio:', error)
        setError('Error al eliminar el ejercicio')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white text-lg">Cargando detalles de la rutina...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!rutina) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>Rutina no encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rutinas')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{rutina.nombre}</h1>
            <p className="text-gray-400 mt-1">{rutina.descripcion}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => navigate(`/rutinas/${id}/editar`)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Rutina</span>
          </button>
          <button
            onClick={() => navigate(`/rutinas/${id}/entrenar`)}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Iniciar Entrenamiento</span>
          </button>
        </div>
      </div>

      {/* Estadísticas de la rutina */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-3 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Ejercicios</p>
              <p className="text-2xl font-bold text-white">{ejercicios.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Duración Estimada</p>
              <p className="text-2xl font-bold text-white">
                {Math.ceil(ejercicios.reduce((total, ej) => total + (ej.series * (ej.descanso_segundos || 60)), 0) / 60)} min
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Series Totales</p>
              <p className="text-2xl font-bold text-white">
                {ejercicios.reduce((total, ej) => total + ej.series, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de ejercicios */}
      <div className="card">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Ejercicios</h2>
            <button
              onClick={() => navigate(`/rutinas/${id}/agregar-ejercicio`)}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Ejercicio</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {ejercicios.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No hay ejercicios en esta rutina</p>
              <button
                onClick={() => navigate(`/rutinas/${id}/agregar-ejercicio`)}
                className="btn-primary"
              >
                Agregar Primer Ejercicio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ejercicios.map((ejercicio, index) => (
                <div
                  key={ejercicio.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-dark-200 rounded-lg border border-gray-700 space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium">{ejercicio.nombre}</h3>
                      <p className="text-gray-400 text-sm">{ejercicio.grupo_muscular}</p>
                      {ejercicio.descripcion && (
                        <p className="text-gray-500 text-xs mt-1 truncate">
                          {ejercicio.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <div className="text-center">
                        <p className="text-white font-semibold">{ejercicio.series}</p>
                        <p className="text-gray-400 text-xs">Series</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">{ejercicio.repeticiones}</p>
                        <p className="text-gray-400 text-xs">Reps</p>
                      </div>
                      {ejercicio.peso_sugerido && (
                        <div className="text-center">
                          <p className="text-white font-semibold">{ejercicio.peso_sugerido}kg</p>
                          <p className="text-gray-400 text-xs">Peso</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-white font-semibold">{ejercicio.descanso_segundos || 60}s</p>
                        <p className="text-gray-400 text-xs">Descanso</p>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/rutinas/${id}/ejercicios/${ejercicio.ejercicio_id}/editar`)}
                        className="text-gray-400 hover:text-primary-400 transition-colors p-1"
                        title="Editar ejercicio"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarEjercicio(ejercicio.ejercicio_id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Eliminar ejercicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notas de la rutina */}
      {rutina.notas && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Notas</h3>
          <p className="text-gray-300">{rutina.notas}</p>
        </div>
      )}
    </div>
  )
}

export default RutinaDetalle
