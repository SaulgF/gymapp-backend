// Configuración de API para el frontend
export const API_BASE_URL_PROD = '/gym-api/api';
export const API_BASE_URL_DEV = 'http://localhost:8765/api';

// Detectar entorno y usar la URL apropiada
export const getApiUrl = () => {
  // En desarrollo (localhost:5173 o localhost:3000)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_BASE_URL_DEV;
  }
  // En producción (hosting compartido)
  return API_BASE_URL_PROD;
};

// URL base para usar en los servicios
export const API_BASE_URL = getApiUrl();

console.log('🔗 API URL configurada:', API_BASE_URL);
