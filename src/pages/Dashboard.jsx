import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { 
  Activity, 
  Calendar, 
  Dumbbell, 
  TrendingUp,
  Clock,
  Target,
  Award,
  BarChart3
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalEntrenamientos: 0,
    entrenamientosSemana: 0,
    rutinasActivas: 0,
    ejerciciosRealizados: 0
  })
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Solicitar permiso y suscribir a push al cargar el dashboard
    subscribeUserToPush();
  }, [])

  // Suscripción push
  const subscribeUserToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BIxX7RXtPdPDWZN6dOVKxzZGGHkn98ODZ2W4-cgL0IpXT3zbaNLLZwq5dM5lTv9b877zaE0mq5xkGz9947mWBNI' // Reemplaza por tu clave pública VAPID
        });
        await api.post('/push/subscribe', subscription);
        console.log('Suscripción push exitosa');
      } catch (err) {
        console.error('Error en suscripción push:', err);
      }
    }
  };

  // Ejemplo: disparar notificación push (llama a este método cuando termine el contador de descanso)
  const sendPushNotification = async () => {
    try {
      await api.post('/push/notify', {
        title: '¡Descanso terminado!',
        body: 'Es hora de continuar con tu siguiente ejercicio.'
      });
      console.log('Notificación push enviada');
    } catch (err) {
      console.error('Error enviando push:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, workoutsResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-workouts')
      ])
      setStats(statsResponse.data)
      setRecentWorkouts(workoutsResponse.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Entrenamientos Totales',
      value: stats.totalEntrenamientos,
      icon: Activity,
      color: 'bg-blue-600',
      trend: '+12%'
    },
    {
      title: 'Esta Semana',
      value: stats.entrenamientosSemana,
      icon: Calendar,
      color: 'bg-green-600',
      trend: '+5%'
    },
    {
      title: 'Rutinas Activas',
      value: stats.rutinasActivas,
      icon: Dumbbell,
      color: 'bg-purple-600',
      trend: '0%'
    },
    {
      title: 'Ejercicios Realizados',
      value: stats.ejerciciosRealizados,
      icon: Target,
      color: 'bg-orange-600',
      trend: '+8%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Resumen de tu progreso en el gimnasio
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Última actualización: hace 5 min</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">{stat.trend}</span>
                <span className="text-sm text-gray-400 ml-1">vs mes anterior</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Progreso Semanal</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de progreso</p>
              <p className="text-sm">(Próximamente)</p>
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Entrenamientos Recientes</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{workout.nombre}</p>
                    <p className="text-sm text-gray-400">{workout.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-400">
                      {workout.ejercicios} ejercicios
                    </p>
                    <p className="text-xs text-gray-400">{workout.duracion}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay entrenamientos recientes</p>
                <p className="text-sm">¡Comienza tu primera rutina!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Objetivos del Mes</h3>
          <Award className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Entrenamientos</span>
              <span className="text-sm text-primary-400">12/20</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div className="bg-dark-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Peso Objetivo</span>
              <span className="text-sm text-green-400">75/80 kg</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
          
          <div className="bg-dark-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Consistencia</span>
              <span className="text-sm text-orange-400">85%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
