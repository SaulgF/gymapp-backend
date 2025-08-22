import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, RotateCcw, Check, Timer, Weight } from 'lucide-react'
import api from '../services/api'

const IniciarEntrenamiento = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rutina, setRutina] = useState(null)
  const [ejercicios, setEjercicios] = useState([])
  const [currentEjercicioIndex, setCurrentEjercicioIndex] = useState(0)
  const [currentSerie, setCurrentSerie] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [entrenamiento, setEntrenamiento] = useState(null)
  const [ejercicioCompletado, setEjercicioCompletado] = useState({})
  
  // Timer
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [initialTime, setInitialTime] = useState(0) // Para el círculo de progreso
  
  // Datos del set actual
  const [setData, setSetData] = useState({
    repeticiones: '',
    peso: '',
    completado: false
  })

  // Datos del entrenamiento
  const [detallesEntrenamiento, setDetallesEntrenamiento] = useState([])
  const [notaGeneral, setNotaGeneral] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    let interval = null
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
      // Notificación cuando el timer termina
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Descanso terminado!', {
          body: 'Es hora de continuar con el siguiente set',
          icon: '/vite.svg'
        })
      }
      // Vibración en móviles
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rutinaRes, ejerciciosRes] = await Promise.all([
        api.get(`/rutinas/${id}`),
        api.get(`/rutinas/${id}/ejercicios`)
      ])
      
      setRutina(rutinaRes.data)
      setEjercicios(ejerciciosRes.data)
      
      // Inicializar datos del primer ejercicio
      if (ejerciciosRes.data.length > 0) {
        const primerEjercicio = ejerciciosRes.data[0]
        setSetData({
          repeticiones: primerEjercicio.repeticiones || '',
          peso: primerEjercicio.peso_sugerido || '',
          completado: false
        })
      }

      // Crear entrenamiento
      const entrenamientoRes = await api.post('/entrenamientos', {
        rutina_id: parseInt(id),
        fecha_inicio: new Date().toISOString()
      })
      setEntrenamiento(entrenamientoRes.data)

    } catch (error) {
      console.error('Error cargando datos:', error)
      console.error('Error response:', error.response)
      
      if (error.response) {
        setError(`Error ${error.response.status}: ${error.response.data.message || 'Error del servidor'}`)
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.')
      } else {
        setError('Error al cargar los datos de la rutina: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = (seconds) => {
    setTimeLeft(seconds)
    setInitialTime(seconds) // Guardar tiempo inicial
    setTimerActive(true)
  }

  const pauseTimer = () => {
    setTimerActive(false)
  }

  const resetTimer = () => {
    setTimerActive(false)
    setTimeLeft(0)
    setInitialTime(0) // Reset tiempo inicial
  }

  const handleCompletarSerie = async () => {
    if (!setData.repeticiones || setData.repeticiones < 1) {
      setError('Ingresa las repeticiones completadas')
      return
    }

    const ejercicioActual = ejercicios[currentEjercicioIndex]
    
    // Guardar detalle de la serie
    const detalle = {
      entrenamiento_id: entrenamiento.id,
      ejercicio_id: ejercicioActual.ejercicio_id,
      serie_numero: currentSerie,
      repeticiones: parseInt(setData.repeticiones),
      peso: setData.peso ? parseFloat(setData.peso) : null,
      notas: setData.notas || ''
    }

    try {
      await api.post('/entrenamiento-detalles', detalle)
      
      // Agregar al estado local
      setDetallesEntrenamiento([...detallesEntrenamiento, detalle])

      // Marcar como completado
      setSetData({ ...setData, completado: true })

      // Iniciar timer de descanso
      if (currentSerie < ejercicioActual.series) {
        startTimer(ejercicioActual.descanso_segundos || 60)
      }

    } catch (error) {
      console.error('Error guardando serie:', error)
      setError('Error al guardar la serie')
    }
  }

  const handleSiguienteSerie = () => {
    const ejercicioActual = ejercicios[currentEjercicioIndex]
    
    if (currentSerie < ejercicioActual.series) {
      setCurrentSerie(currentSerie + 1)
      setSetData({
        repeticiones: ejercicioActual.repeticiones || '',
        peso: setData.peso, // Mantener el peso
        completado: false
      })
      resetTimer()
    } else {
      // Ejercicio completado
      setEjercicioCompletado({
        ...ejercicioCompletado,
        [currentEjercicioIndex]: true
      })
      handleSiguienteEjercicio()
    }
  }

  const handleSiguienteEjercicio = () => {
    if (currentEjercicioIndex < ejercicios.length - 1) {
      const siguienteIndex = currentEjercicioIndex + 1
      const siguienteEjercicio = ejercicios[siguienteIndex]
      
      setCurrentEjercicioIndex(siguienteIndex)
      setCurrentSerie(1)
      setSetData({
        repeticiones: siguienteEjercicio.repeticiones || '',
        peso: siguienteEjercicio.peso_sugerido || '',
        completado: false
      })
      resetTimer()
    } else {
      // Entrenamiento completado
      handleFinalizarEntrenamiento()
    }
  }

  const handleFinalizarEntrenamiento = async () => {
    try {
      await api.put(`/entrenamientos/${entrenamiento.id}`, {
        fecha_fin: new Date().toISOString(),
        notas_generales: notaGeneral
      })
      
      navigate('/entrenamientos', { 
        state: { message: 'Entrenamiento completado exitosamente' }
      })
    } catch (error) {
      console.error('Error finalizando entrenamiento:', error)
      setError('Error al finalizar el entrenamiento')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white text-lg">Iniciando entrenamiento...</div>
      </div>
    )
  }

  if (!ejercicios.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/rutinas/${id}`)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Error</h1>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
          <p className="text-yellow-400">Esta rutina no tiene ejercicios configurados</p>
        </div>
      </div>
    )
  }

  const ejercicioActual = ejercicios[currentEjercicioIndex]
  const progress = ((currentEjercicioIndex + (currentSerie / ejercicioActual.series)) / ejercicios.length) * 100

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
            <h1 className="text-3xl font-bold text-white">Entrenamiento en Progreso</h1>
            <p className="text-gray-400 mt-1">{rutina?.nombre}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Progreso general */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300">Progreso del entrenamiento</span>
          <span className="text-primary-400 font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-dark-300 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>Ejercicio {currentEjercicioIndex + 1} de {ejercicios.length}</span>
          <span>Serie {currentSerie} de {ejercicioActual.series}</span>
        </div>
      </div>

      {/* Modal de Timer de Descanso */}
      {timerActive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className={`bg-dark-100 rounded-xl border p-8 max-w-md w-full mx-4 animate-pulse-scale transition-all duration-300 ${
            timeLeft <= 10 && timeLeft > 0 ? 'border-red-500 animate-pulse' : 'border-primary-500'
          }`}>
            <div className="text-center">
              {/* Círculo de progreso */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 rotate-90" viewBox="0 0 36 36">
                  {/* Fondo del círculo */}
                  <path
                    className="text-dark-300"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progreso del círculo */}
                  <path
                    className={`transition-all duration-1000 ease-linear ${
                      timeLeft <= 10 && timeLeft > 0 ? 'text-red-400' : 'text-primary-400'
                    }`}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Timer en el centro */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-4xl font-bold transition-colors duration-300 ${
                    timeLeft <= 10 && timeLeft > 0 ? 'text-red-400' : 'text-primary-400'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {timeLeft <= 10 && timeLeft > 0 ? '¡Casi listo!' : 'Tiempo de Descanso'}
              </h3>
              <p className="text-gray-300 mb-6">
                {timeLeft <= 10 && timeLeft > 0 
                  ? 'Prepárate para la siguiente serie' 
                  : 'Descansa para la siguiente serie'
                }
              </p>

              {/* Botones de control */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={pauseTimer}
                  className="btn-secondary flex items-center space-x-2 px-6 py-3"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pausar</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="btn-primary flex items-center space-x-2 px-6 py-3"
                >
                  <Check className="w-5 h-5" />
                  <span>Continuar</span>
                </button>
              </div>

              {/* Botón de agregar tiempo */}
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  onClick={() => setTimeLeft(timeLeft + 30)}
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors px-3 py-1 rounded border border-gray-600 hover:border-primary-500"
                >
                  +30s
                </button>
                <button
                  onClick={() => setTimeLeft(timeLeft + 60)}
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors px-3 py-1 rounded border border-gray-600 hover:border-primary-500"
                >
                  +1min
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ejercicio actual */}
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{ejercicioActual.nombre}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{ejercicioActual.grupo_muscular}</span>
            <span>•</span>
            <span>{ejercicioActual.equipamiento}</span>
            <span>•</span>
            <span className="capitalize">{ejercicioActual.dificultad}</span>
          </div>
        </div>

        {ejercicioActual.descripcion && (
          <div className="mb-6 p-4 bg-dark-300 rounded-lg">
            <p className="text-gray-300">{ejercicioActual.descripcion}</p>
          </div>
        )}

        {ejercicioActual.notas && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
            <p className="text-yellow-300">📝 {ejercicioActual.notas}</p>
          </div>
        )}

        {/* Serie actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Serie {currentSerie} de {ejercicioActual.series}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repeticiones *
                </label>
                <input
                  type="number"
                  min="1"
                  value={setData.repeticiones}
                  onChange={(e) => setSetData({...setData, repeticiones: e.target.value})}
                  className="input-field w-full"
                  placeholder={ejercicioActual.repeticiones}
                  disabled={setData.completado}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={setData.peso}
                  onChange={(e) => setSetData({...setData, peso: e.target.value})}
                  className="input-field w-full"
                  placeholder={ejercicioActual.peso_sugerido}
                  disabled={setData.completado}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={setData.notas || ''}
                onChange={(e) => setSetData({...setData, notas: e.target.value})}
                className="input-field w-full resize-none"
                rows="2"
                placeholder="Cómo te sentiste, técnica, etc..."
                disabled={setData.completado}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Meta del ejercicio</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
                <span className="text-gray-300">Repeticiones objetivo:</span>
                <span className="text-white font-semibold">{ejercicioActual.repeticiones}</span>
              </div>
              {ejercicioActual.peso_sugerido && (
                <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
                  <span className="text-gray-300">Peso sugerido:</span>
                  <span className="text-white font-semibold">{ejercicioActual.peso_sugerido} kg</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
                <span className="text-gray-300">Descanso:</span>
                <span className="text-white font-semibold">{ejercicioActual.descanso_segundos}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-4 mt-8">
          {!setData.completado ? (
            <button
              onClick={handleCompletarSerie}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Completar Serie</span>
            </button>
          ) : (
            <button
              onClick={handleSiguienteSerie}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>
                {currentSerie < ejercicioActual.series 
                  ? 'Siguiente Serie' 
                  : currentEjercicioIndex < ejercicios.length - 1 
                    ? 'Siguiente Ejercicio' 
                    : 'Finalizar Entrenamiento'
                }
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Nota general del entrenamiento */}
      {currentEjercicioIndex === ejercicios.length - 1 && currentSerie === ejercicioActual.series && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Nota general del entrenamiento</h3>
          <textarea
            value={notaGeneral}
            onChange={(e) => setNotaGeneral(e.target.value)}
            className="input-field w-full resize-none"
            rows="3"
            placeholder="¿Cómo fue el entrenamiento? ¿Alguna observación?"
          />
        </div>
      )}

      {/* Resumen de ejercicios */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ejercicios de la rutina</h3>
        <div className="space-y-3">
          {ejercicios.map((ejercicio, index) => (
            <div 
              key={ejercicio.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index === currentEjercicioIndex 
                  ? 'bg-primary-500/20 border border-primary-500' 
                  : ejercicioCompletado[index] 
                    ? 'bg-green-500/20 border border-green-500' 
                    : 'bg-dark-300'
              }`}
            >
              <div>
                <span className={`font-medium ${
                  index === currentEjercicioIndex ? 'text-primary-400' : 
                  ejercicioCompletado[index] ? 'text-green-400' : 'text-white'
                }`}>
                  {ejercicio.nombre}
                </span>
                <p className="text-sm text-gray-400">
                  {ejercicio.series} series × {ejercicio.repeticiones} reps
                </p>
              </div>
              <div className="text-right">
                {ejercicioCompletado[index] ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : index === currentEjercicioIndex ? (
                  <Play className="w-5 h-5 text-primary-400" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IniciarEntrenamiento
