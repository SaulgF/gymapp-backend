import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  Filter
} from 'lucide-react'

const Rutinas = () => {
  const navigate = useNavigate()
  const [rutinas, setRutinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedRutina, setSelectedRutina] = useState(null)
  const [filter, setFilter] = useState('todas')

  useEffect(() => {
    fetchRutinas()
  }, [])

  const fetchRutinas = async () => {
    try {
      const response = await api.get('/rutinas')
      setRutinas(response.data)
    } catch (error) {
      console.error('Error fetching rutinas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRutina = () => {
    setSelectedRutina(null)
    setShowModal(true)
  }

  const handleEditRutina = (rutina) => {
    setSelectedRutina(rutina)
    setShowModal(true)
  }

  const handleViewDetails = (rutinaId) => {
    navigate(`/rutinas/${rutinaId}`)
  }

  const handleDeleteRutina = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      try {
        await api.delete(`/rutinas/${id}`)
        setRutinas(rutinas.filter(r => r.id !== id))
      } catch (error) {
        console.error('Error deleting rutina:', error)
      }
    }
  }

  const filteredRutinas = rutinas.filter(rutina => {
    if (filter === 'todas') return true
    return rutina.dia.toLowerCase() === filter.toLowerCase()
  })

  const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']

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
          <h1 className="text-3xl font-bold text-white">Rutinas</h1>
          <p className="text-gray-400 mt-1">
            Gestiona tus rutinas de entrenamiento
          </p>
        </div>
        <button
          onClick={handleCreateRutina}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Rutina</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filtrar por día:</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="todas">Todas</option>
          {diasSemana.map(dia => (
            <option key={dia} value={dia}>{dia}</option>
          ))}
        </select>
      </div>

      {/* Rutinas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRutinas.map((rutina) => (
          <div key={rutina.id} className="card p-6 hover:border-primary-500 transition-colors duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {rutina.nombre}
                </h3>
                <p className="text-sm text-gray-400">{rutina.grupo_muscular}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditRutina(rutina)}
                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRutina(rutina.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-gray-300">{rutina.dia}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-gray-300">
                  {rutina.ejercicios?.length || 0} ejercicios
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-gray-300">
                  {rutina.usuarios_asignados || 0} usuarios asignados
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button 
                onClick={() => handleViewDetails(rutina.id)}
                className="btn-secondary w-full text-sm"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRutinas.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No hay rutinas disponibles
          </h3>
          <p className="text-gray-400 mb-4">
            {filter === 'todas' 
              ? 'Comienza creando tu primera rutina de entrenamiento'
              : `No hay rutinas para ${filter}`
            }
          </p>
          <button
            onClick={handleCreateRutina}
            className="btn-primary"
          >
            Crear Primera Rutina
          </button>
        </div>
      )}

      {/* Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-100 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedRutina ? 'Editar Rutina' : 'Nueva Rutina'}
            </h3>
            <p className="text-gray-400 mb-4">
              Modal de creación/edición de rutinas (por implementar)
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button className="btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rutinas
