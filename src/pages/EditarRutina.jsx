import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import api from '../services/api'

const EditarRutina = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [rutina, setRutina] = useState({
    nombre: '',
    descripcion: '',
    dia: '',
    grupo_muscular: '',
    notas: ''
  })

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const gruposMusculares = [
    'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 
    'Abdomen', 'Full Body', 'Cardio', 'Funcional'
  ]

  useEffect(() => {
    fetchRutina()
  }, [id])

  const fetchRutina = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/rutinas/${id}`)
      setRutina(response.data)
    } catch (error) {
      console.error('Error obteniendo rutina:', error)
      setError('Error al cargar la rutina')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!rutina.nombre.trim()) {
      setError('El nombre de la rutina es requerido')
      return
    }

    try {
      setSaving(true)
      setError('')
      
      await api.put(`/rutinas/${id}`, {
        nombre: rutina.nombre.trim(),
        descripcion: rutina.descripcion.trim(),
        dia: rutina.dia,
        grupo_muscular: rutina.grupo_muscular,
        notas: rutina.notas.trim()
      })

      navigate(`/rutinas/${id}`)
    } catch (error) {
      console.error('Error actualizando rutina:', error)
      setError(error.response?.data?.message || 'Error al actualizar la rutina')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setRutina(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white text-lg">Cargando rutina...</div>
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
            <h1 className="text-3xl font-bold text-white">Editar Rutina</h1>
            <p className="text-gray-400 mt-1">Modifica los detalles de tu rutina</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Formulario */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              id="nombre"
              value={rutina.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className="input-field w-full"
              placeholder="Ej: Rutina de Pecho y Tríceps"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={rutina.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={3}
              className="input-field w-full resize-none"
              placeholder="Describe brevemente esta rutina..."
            />
          </div>

          {/* Día y Grupo Muscular */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dia" className="block text-sm font-medium text-gray-300 mb-2">
                Día de la Semana
              </label>
              <select
                id="dia"
                value={rutina.dia}
                onChange={(e) => handleChange('dia', e.target.value)}
                className="input-field w-full"
              >
                <option value="">Seleccionar día</option>
                {diasSemana.map(dia => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="grupo_muscular" className="block text-sm font-medium text-gray-300 mb-2">
                Grupo Muscular Principal
              </label>
              <select
                id="grupo_muscular"
                value={rutina.grupo_muscular}
                onChange={(e) => handleChange('grupo_muscular', e.target.value)}
                className="input-field w-full"
              >
                <option value="">Seleccionar grupo</option>
                {gruposMusculares.map(grupo => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notas" className="block text-sm font-medium text-gray-300 mb-2">
              Notas Adicionales
            </label>
            <textarea
              id="notas"
              value={rutina.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              rows={4}
              className="input-field w-full resize-none"
              placeholder="Instrucciones especiales, recordatorios, etc..."
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/rutinas/${id}`)}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarRutina
