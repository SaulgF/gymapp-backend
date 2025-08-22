import axios from 'axios'

// URL base de la API Node.js (Railway o local)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejar errores de autenticacion
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      // Opcional: redirigir al login
      window.location.href = '/gym/login'
    }
    return Promise.reject(error)
  }
)

// Exportar la instancia por defecto
export default api

// También exportar métodos específicos si se necesitan
export const { get, post, put, delete: del, patch } = api
