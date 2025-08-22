import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Filter,
  Play,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react'

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [selectedEjercicio, setSelectedEjercicio] = useState(null)

  const gruposMusculares = [
    'Pecho y Bíceps',
    'Espalda y Tríceps',
    'Piernas',
    'Hombros y Abdomen'
  ]

  useEffect(() => {
    fetchEjercicios()
  }, [])

  const fetchEjercicios = async () => {
    try {
      const response = await api.get('/ejercicios')
      setEjercicios(response.data)
    } catch (error) {
      console.error('Error fetching ejercicios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEjercicio = () => {
    setSelectedEjercicio(null)
    setShowModal(true)
  }

  const handleEditEjercicio = (ejercicio) => {
    setSelectedEjercicio(ejercicio)
    setShowModal(true)
  }

  const handleDeleteEjercicio = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      try {
        await api.delete(`/ejercicios/${id}`)
        setEjercicios(ejercicios.filter(e => e.id !== id))
      } catch (error) {
        console.error('Error deleting ejercicio:', error)
      }
    }
  }

  const filteredEjercicios = ejercicios.filter(ejercicio => {
    const matchesSearch = ejercicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGroup = selectedGroup === 'todos' || ejercicio.grupo_muscular === selectedGroup
    return matchesSearch && matchesGroup
  })

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
          <h1 className="text-3xl font-bold text-white">Ejercicios</h1>
          <p className="text-gray-400 mt-1">
            Biblioteca de ejercicios disponibles
          </p>
        </div>
        <button
          onClick={handleCreateEjercicio}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Ejercicio</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="input-field w-auto"
          >
            <option value="todos">Todos los grupos</option>
            {gruposMusculares.map(grupo => (
              <option key={grupo} value={grupo}>{grupo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-400">
        Mostrando {filteredEjercicios.length} de {ejercicios.length} ejercicios
      </div>

      {/* Ejercicios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEjercicios.map((ejercicio) => (
          <div key={ejercicio.id} className="card p-6 hover:border-primary-500 transition-colors duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {ejercicio.nombre}
                </h3>
                <span className="inline-block bg-primary-900 text-primary-200 text-xs px-2 py-1 rounded-full">
                  {ejercicio.grupo_muscular}
                </span>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => handleEditEjercicio(ejercicio)}
                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEjercicio(ejercicio.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {ejercicio.video_url ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Video disponible</span>
                  <button className="flex items-center space-x-1 text-primary-400 hover:text-primary-300 transition-colors duration-200">
                    <Play className="w-4 h-4" />
                    <span className="text-sm">Ver video</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Sin video</span>
                  <button className="flex items-center space-x-1 text-gray-500 text-sm">
                    <ExternalLink className="w-4 h-4" />
                    <span>Agregar video</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button className="btn-secondary w-full text-sm">
                Agregar a Rutina
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEjercicios.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No se encontraron ejercicios
          </h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedGroup !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer ejercicio'
            }
          </p>
          {!searchTerm && selectedGroup === 'todos' && (
            <button
              onClick={handleCreateEjercicio}
              className="btn-primary"
            >
              Crear Primer Ejercicio
            </button>
          )}
        </div>
      )}

      {/* Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-100 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedEjercicio ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
            </h3>
            <p className="text-gray-400 mb-4">
              Modal de creación/edición de ejercicios (por implementar)
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

export default Ejercicios
