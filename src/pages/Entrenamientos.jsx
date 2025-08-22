import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { 
  Activity, 
  Plus, 
  Calendar, 
  Clock,
  Target,
  Weight,
  FileText,
  Save,
  X
} from 'lucide-react'

const Entrenamientos = () => {
  const [entrenamientos, setEntrenamientos] = useState([])
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null)
  const [newEntrenamiento, setNewEntrenamiento] = useState({
    rutina_id: '',
    fecha: new Date().toISOString().split('T')[0],
    nota_general: '',
    ejercicios: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [entrenamientosResponse, rutinasResponse] = await Promise.all([
        api.get('/entrenamientos'),
        api.get('/rutinas')
      ])
      
      setEntrenamientos(entrenamientosResponse.data)
      setRutinas(rutinasResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEntrenamiento = () => {
    setSelectedEntrenamiento(null)
    setNewEntrenamiento({
      rutina_id: '',
      fecha: new Date().toISOString().split('T')[0],
      nota_general: '',
      ejercicios: []
    })
    setShowModal(true)
  }

  const handleRutinaChange = async (rutinaId) => {
    setNewEntrenamiento(prev => ({ ...prev, rutina_id: rutinaId }))
    
    if (rutinaId) {
      try {
        const response = await api.get(`/rutinas/${rutinaId}/ejercicios`)
        const ejercicios = response.data.map(ejercicio => ({
          ejercicio_id: ejercicio.id,
          nombre: ejercicio.nombre,
          series: ejercicio.series,
          reps_objetivo: ejercicio.reps_objetivo,
          reps_realizadas: '',
          peso_usado: '',
          nota: ''
        }))
        setNewEntrenamiento(prev => ({ ...prev, ejercicios }))
      } catch (error) {
        console.error('Error fetching rutina ejercicios:', error)
      }
    }
  }

  const handleEjercicioChange = (index, field, value) => {
    setNewEntrenamiento(prev => ({
      ...prev,
      ejercicios: prev.ejercicios.map((ejercicio, i) => 
        i === index ? { ...ejercicio, [field]: value } : ejercicio
      )
    }))
  }

  const handleSaveEntrenamiento = async () => {
    try {
      await api.post('/entrenamientos', newEntrenamiento)
      await fetchData()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving entrenamiento:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Entrenamientos</h1>
          <p className="text-gray-400 mt-1">
            Registra y sigue tu progreso diario
          </p>
        </div>
        <button
          onClick={handleCreateEntrenamiento}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Entrenamiento</span>
        </button>
      </div>

      {/* Entrenamientos List */}
      <div className="space-y-4">
        {entrenamientos.map((entrenamiento) => (
          <div key={entrenamiento.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {entrenamiento.rutina_nombre}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{entrenamiento.fecha}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{entrenamiento.duracion || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{entrenamiento.ejercicios_completados} ejercicios</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-primary-400">
                  {entrenamiento.progreso || '0'}%
                </span>
                <p className="text-xs text-gray-400">Completado</p>
              </div>
            </div>

            {entrenamiento.nota_general && (
              <div className="mb-4 p-3 bg-dark-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Nota general:</span>
                </div>
                <p className="text-sm text-gray-400">{entrenamiento.nota_general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {entrenamiento.detalles?.map((detalle, index) => (
                <div key={index} className="bg-dark-200 p-3 rounded-lg">
                  <h4 className="font-medium text-white text-sm mb-2">
                    {detalle.ejercicio_nombre}
                  </h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Repeticiones:</span>
                      <span className="text-white">{detalle.reps_realizadas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peso:</span>
                      <span className="text-white">{detalle.peso_usado} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {entrenamientos.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No hay entrenamientos registrados
          </h3>
          <p className="text-gray-400 mb-4">
            Comienza registrando tu primer entrenamiento
          </p>
          <button
            onClick={handleCreateEntrenamiento}
            className="btn-primary"
          >
            Registrar Primer Entrenamiento
          </button>
        </div>
      )}

      {/* Modal para nuevo entrenamiento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Nuevo Entrenamiento
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rutina
                  </label>
                  <select
                    value={newEntrenamiento.rutina_id}
                    onChange={(e) => handleRutinaChange(e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Seleccionar rutina</option>
                    {rutinas.map(rutina => (
                      <option key={rutina.id} value={rutina.id}>
                        {rutina.nombre} - {rutina.dia}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newEntrenamiento.fecha}
                    onChange={(e) => setNewEntrenamiento(prev => ({ ...prev, fecha: e.target.value }))}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>

              {/* Nota general */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nota general del entrenamiento
                </label>
                <textarea
                  value={newEntrenamiento.nota_general}
                  onChange={(e) => setNewEntrenamiento(prev => ({ ...prev, nota_general: e.target.value }))}
                  placeholder="¿Cómo te sentiste? Observaciones generales..."
                  className="input-field w-full h-20 resize-none"
                />
              </div>

              {/* Ejercicios */}
              {newEntrenamiento.ejercicios.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Ejercicios</h4>
                  <div className="space-y-4">
                    {newEntrenamiento.ejercicios.map((ejercicio, index) => (
                      <div key={index} className="card p-4">
                        <h5 className="font-medium text-white mb-3">{ejercicio.nombre}</h5>
                        <div className="text-sm text-gray-400 mb-3">
                          Objetivo: {ejercicio.series} series de {ejercicio.reps_objetivo} repeticiones
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Repeticiones realizadas
                            </label>
                            <input
                              type="number"
                              value={ejercicio.reps_realizadas}
                              onChange={(e) => handleEjercicioChange(index, 'reps_realizadas', e.target.value)}
                              className="input-field w-full text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Peso usado (kg)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={ejercicio.peso_usado}
                              onChange={(e) => handleEjercicioChange(index, 'peso_usado', e.target.value)}
                              className="input-field w-full text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Nota del ejercicio
                            </label>
                            <input
                              type="text"
                              value={ejercicio.nota}
                              onChange={(e) => handleEjercicioChange(index, 'nota', e.target.value)}
                              className="input-field w-full text-sm"
                              placeholder="Observaciones..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEntrenamiento}
                className="btn-primary flex items-center space-x-2"
                disabled={!newEntrenamiento.rutina_id}
              >
                <Save className="w-4 h-4" />
                <span>Guardar Entrenamiento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Entrenamientos
