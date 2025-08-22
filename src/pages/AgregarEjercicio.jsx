import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react'
import api from '../services/api'

const AgregarEjercicio = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ejercicios, setEjercicios] = useState([])
  const [filteredEjercicios, setFilteredEjercicios] = useState([])
  const [rutina, setRutina] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrupo, setSelectedGrupo] = useState('')
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [error, setError] = useState('')

  // Configuración del ejercicio
  const [config, setConfig] = useState({
    series: 3,
    repeticiones: 10,
    peso_sugerido: '',
    descanso_segundos: 60,
    notas: ''
  })

  const gruposMusculares = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Abdomen', 'Cardio']

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    filterEjercicios()
  }, [ejercicios, searchTerm, selectedGrupo])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ejerciciosRes, rutinaRes] = await Promise.all([
        api.get('/ejercicios'),
        api.get(`/rutinas/${id}`)
      ])
      
      setEjercicios(ejerciciosRes.data)
      setRutina(rutinaRes.data)
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const filterEjercicios = () => {
    let filtered = ejercicios

    if (searchTerm) {
      filtered = filtered.filter(ejercicio =>
        ejercicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ejercicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedGrupo && selectedGrupo !== 'Todos') {
      filtered = filtered.filter(ejercicio =>
        ejercicio.grupo_muscular === selectedGrupo
      )
    }

    setFilteredEjercicios(filtered)
  }

  const handleSelectEjercicio = (ejercicio) => {
    setEjercicioSeleccionado(ejercicio)
    setShowConfigModal(true)
    // Reset config to defaults
    setConfig({
      series: 3,
      repeticiones: 10,
      peso_sugerido: '',
      descanso_segundos: 60,
      notas: ''
    })
  }

  const handleAgregarEjercicio = async () => {
    try {
      await api.post(`/rutinas/${id}/ejercicios`, {
        ejercicio_id: ejercicioSeleccionado.id,
        series: config.series,
        repeticiones: config.repeticiones,
        peso_sugerido: config.peso_sugerido || null,
        descanso_segundos: config.descanso_segundos,
        notas: config.notas
      })

      navigate(`/rutinas/${id}`)
    } catch (error) {
      console.error('Error agregando ejercicio:', error)
      setError('Error al agregar el ejercicio a la rutina')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white text-lg">Cargando ejercicios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/rutinas/${id}`)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Agregar Ejercicio</h1>
            <p className="text-gray-400 mt-1">Rutina: {rutina?.nombre}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar ejercicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>

          {/* Filtro por grupo */}
          <select
            value={selectedGrupo}
            onChange={(e) => setSelectedGrupo(e.target.value)}
            className="input-field w-full"
          >
            {gruposMusculares.map(grupo => (
              <option key={grupo} value={grupo === 'Todos' ? '' : grupo}>
                {grupo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de ejercicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEjercicios.map((ejercicio) => (
          <div key={ejercicio.id} className="card p-6 hover:border-primary-500 transition-colors">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{ejercicio.nombre}</h3>
                <p className="text-sm text-primary-400">{ejercicio.grupo_muscular}</p>
              </div>
              
              {ejercicio.descripcion && (
                <p className="text-sm text-gray-400 line-clamp-3">{ejercicio.descripcion}</p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{ejercicio.equipamiento}</span>
                <span className="capitalize">{ejercicio.dificultad}</span>
              </div>

              <button
                onClick={() => handleSelectEjercicio(ejercicio)}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEjercicios.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No se encontraron ejercicios</p>
          <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      {/* Modal de configuración */}
      {showConfigModal && ejercicioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Configurar: {ejercicioSeleccionado.nombre}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Series
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.series}
                    onChange={(e) => setConfig({...config, series: parseInt(e.target.value)})}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Repeticiones
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={config.repeticiones}
                    onChange={(e) => setConfig({...config, repeticiones: parseInt(e.target.value)})}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Peso (kg)
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Descanso (seg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="600"
                    step="15"
                    value={config.descanso_segundos}
                    onChange={(e) => setConfig({...config, descanso_segundos: parseInt(e.target.value)})}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={config.notas}
                  onChange={(e) => setConfig({...config, notas: e.target.value})}
                  className="input-field w-full resize-none"
                  rows="2"
                  placeholder="Instrucciones especiales..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarEjercicio}
                className="btn-primary flex-1"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgregarEjercicio
