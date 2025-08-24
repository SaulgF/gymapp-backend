<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GymApp - Instrucciones de Desarrollo

Este es un proyecto de aplicación de gimnasio con React + Vite en el frontend y Node.js + Express en el backend.

## Estructura del Proyecto

```
gymapp/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas principales
│   ├── contexts/          # Context API (Auth, etc.)
│   ├── hooks/             # Custom hooks
│   └── services/          # API calls
├── backend/               # Backend Node.js
│   └── src/
│       ├── controllers/   # Lógica de negocio
│       ├── routes/        # Definición de rutas
│       ├── middleware/    # Middlewares (auth, etc.)
│       └── config/        # Configuración (DB, etc.)
└── gym.sql               # Schema de base de datos
```

## Tecnologías y Convenciones

### Frontend

- **React 18** con hooks funcionales
- **Tailwind CSS 3.0** para estilos
- **React Router DOM** para navegación
- **Axios** para peticiones HTTP
- **Lucide React** para iconos

### Backend

- **Node.js + Express** para API REST
- **MySQL** como base de datos
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas

### Paleta de Colores

- Primario: `#3b82f6` (blue-600), `#2563eb` (blue-700)
- Fondo oscuro: `#161f28` (dark-300), `#283848` (dark-100)
- Grises: `#1f2937` (dark-200), `#374151` (gray-700)

### Componentes Base

- `btn-primary`: Botones principales azules
- `btn-secondary`: Botones secundarios grises
- `card`: Tarjetas con fondo oscuro y bordes redondeados
- `input-field`: Campos de entrada con estilo consistente

## APIs y Endpoints

### Autenticación

- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Obtener usuario actual

### Dashboard

- `GET /api/dashboard/stats` - Estadísticas del usuario
- `GET /api/dashboard/recent-workouts` - Entrenamientos recientes

### Rutinas

- `GET /api/rutinas` - Listar rutinas del usuario
- `POST /api/rutinas` - Crear nueva rutina
- `GET /api/rutinas/:id/ejercicios` - Ejercicios de una rutina

### Ejercicios

- `GET /api/ejercicios` - Listar todos los ejercicios
- `POST /api/ejercicios` - Crear ejercicio (admin)

### Entrenamientos

- `GET /api/entrenamientos` - Historial de entrenamientos
- `POST /api/entrenamientos` - Registrar nuevo entrenamiento

## Patrones de Código

### Componentes React

- Usar hooks funcionales
- Implementar loading states
- Manejar errores apropiadamente
- Seguir principio de responsabilidad única

### API Calls

- Usar axios con interceptors para auth
- Centralizar configuración en `services/api.js`
- Manejar errores de red y autenticación

### Estados

- Context API para estado global (auth)
- useState para estado local
- Implementar loading y error states

### Estilos

- Preferir clases de Tailwind
- Componentes responsive mobile-first
- Usar variables de color consistentes

## Base de Datos

### Tablas Principales

- `users` - Usuarios del sistema
- `rutinas` - Rutinas de entrenamiento
- `ejercicios` - Biblioteca de ejercicios
- `entrenamientos` - Sesiones de entrenamiento
- `entrenamiento_detalles` - Detalles por ejercicio

### Relaciones

- Usuario → Rutinas (many-to-many via rutinas_usuarios)
- Rutina → Ejercicios (many-to-many via rutina_ejercicios)
- Entrenamiento → Detalles (one-to-many)

## Comandos Útiles

### Desarrollo

```bash
# Frontend
npm run dev

# Backend
cd backend && npm run dev
```

### Base de Datos

- Asegurar XAMPP corriendo
- Importar gym.sql en phpMyAdmin
- Configurar .env en backend

## Consideraciones de Seguridad

- Autenticación JWT en todas las rutas protegidas
- Validación de inputs en backend
- Rate limiting implementado
- Headers de seguridad con Helmet
- Hash de contraseñas con bcrypt
