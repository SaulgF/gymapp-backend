# GymApp Backend

## 🔧 Tecnologías

- **Node.js 18+** - Runtime de JavaScript
- **Express.js 4.19** - Framework web
- **MySQL 8.0** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Protección contra spam

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # Configuración MySQL
│   ├── controllers/
│   │   ├── authController.js   # Autenticación
│   │   ├── dashboardController.js
│   │   ├── rutinasController.js
│   │   ├── ejerciciosController.js
│   │   └── entrenamientosController.js
│   ├── middleware/
│   │   └── auth.js             # Middleware JWT
│   ├── routes/
│   │   ├── auth.js             # Rutas de auth
│   │   ├── dashboard.js
│   │   ├── rutinas.js
│   │   ├── ejercicios.js
│   │   └── entrenamientos.js
│   └── server.js               # Servidor principal
├── .env.example                # Variables de ejemplo
├── .env.production             # Variables de producción
├── Dockerfile                  # Configuración Docker
├── package.json                # Dependencias
└── verify-backend.bat          # Script de verificación
```

## 🚀 Instalación y Desarrollo

### Instalación

```bash
cd backend
npm install
```

### Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gymapp
JWT_SECRET=tu_jwt_secret_desarrollo
FRONTEND_URL=http://localhost:5173
```

### Desarrollo

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

## 📊 APIs Disponibles

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Obtener usuario actual

### Dashboard

- `GET /api/dashboard/stats` - Estadísticas del usuario
- `GET /api/dashboard/recent-workouts` - Entrenamientos recientes

### Rutinas

- `GET /api/rutinas` - Listar rutinas del usuario
- `POST /api/rutinas` - Crear nueva rutina
- `GET /api/rutinas/:id` - Obtener rutina específica
- `PUT /api/rutinas/:id` - Actualizar rutina
- `DELETE /api/rutinas/:id` - Eliminar rutina
- `GET /api/rutinas/:id/ejercicios` - Ejercicios de una rutina
- `POST /api/rutinas/:id/ejercicios` - Agregar ejercicio a rutina

### Ejercicios

- `GET /api/ejercicios` - Listar todos los ejercicios
- `POST /api/ejercicios` - Crear ejercicio (admin)
- `GET /api/ejercicios/:id` - Obtener ejercicio específico
- `PUT /api/ejercicios/:id` - Actualizar ejercicio
- `DELETE /api/ejercicios/:id` - Eliminar ejercicio

### Entrenamientos

- `GET /api/entrenamientos` - Historial de entrenamientos
- `POST /api/entrenamientos` - Iniciar nuevo entrenamiento
- `GET /api/entrenamientos/:id` - Obtener entrenamiento específico
- `PUT /api/entrenamientos/:id` - Finalizar entrenamiento
- `DELETE /api/entrenamientos/:id` - Eliminar entrenamiento

### Detalles de Entrenamiento

- `POST /api/entrenamiento-detalles` - Registrar serie (reps/peso)
- `PUT /api/entrenamiento-detalles/:id` - Actualizar serie
- `DELETE /api/entrenamiento-detalles/:id` - Eliminar serie

## 🔒 Seguridad

### Middleware Implementado

- **Helmet** - Headers de seguridad HTTP
- **CORS** - Configurado para frontend específico
- **Rate Limiting** - 100 requests por 15 minutos
- **JWT Authentication** - Tokens seguros
- **Password Hashing** - bcrypt con salt rounds

### Validaciones

- Validación de entrada en todos los endpoints
- Verificación de pertenencia de recursos al usuario
- Sanitización de datos de entrada

## 🐳 Docker

### Construcción

```bash
# Construir imagen
docker build -t gymapp-backend .

# Ejecutar contenedor
docker run -p 3001:3001 --env-file .env.production gymapp-backend
```

### Con Docker Compose

```bash
# Desde la raíz del proyecto
docker-compose up --build -d
```

## 📊 Base de Datos

### Tablas Principales

- `users` - Usuarios del sistema
- `rutinas` - Rutinas de entrenamiento
- `rutinas_usuarios` - Relación muchos a muchos
- `ejercicios` - Biblioteca de ejercicios
- `rutina_ejercicios` - Ejercicios por rutina
- `entrenamientos` - Sesiones de entrenamiento
- `entrenamiento_detalles` - Series y repeticiones

### Relaciones

```sql
users -> rutinas_usuarios <- rutinas
rutinas -> rutina_ejercicios <- ejercicios
users -> entrenamientos -> entrenamiento_detalles
```

## 🔧 Configuración de Producción

### Variables de Entorno Críticas

```bash
NODE_ENV=production
PORT=3001
DB_HOST=mysql                    # Para Docker
DB_USER=gymapp_user
DB_PASSWORD=password_seguro
DB_NAME=gymapp_prod
JWT_SECRET=jwt_secret_muy_largo_y_seguro
FRONTEND_URL=https://tu-dominio.com
```

### Verificación

```bash
# Verificar configuración
npm run verify

# En Windows
verify-backend.bat
```

## 📈 Monitoreo

### Logs

```bash
# Ver logs en desarrollo
npm run dev

# Ver logs en Docker
docker-compose logs backend -f
```

### Health Check

```bash
# Verificar estado
curl http://localhost:3001/api/health

# Respuesta esperada
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## 🚨 Solución de Problemas

### Errores Comunes

1. **Error de conexión a MySQL**

   ```bash
   # Verificar que MySQL está corriendo
   docker-compose ps mysql

   # Ver logs de MySQL
   docker-compose logs mysql
   ```

2. **Error de autenticación JWT**

   ```bash
   # Verificar JWT_SECRET en .env
   echo $JWT_SECRET
   ```

3. **Error de CORS**
   ```bash
   # Verificar FRONTEND_URL
   echo $FRONTEND_URL
   ```

### Comandos Útiles

```bash
# Reiniciar solo el backend
docker-compose restart backend

# Ver logs en tiempo real
docker-compose logs backend -f

# Acceder al contenedor
docker-compose exec backend sh

# Backup de base de datos
docker-compose exec mysql mysqldump -u root -p gymapp_prod > backup.sql
```

## 📋 Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET seguro generado
- [ ] Base de datos creada e importada
- [ ] CORS configurado para dominio correcto
- [ ] Rate limiting activado
- [ ] Logs configurados
- [ ] Backup automatizado
- [ ] Monitoreo implementado

## 🎯 Estado Actual

✅ **Backend 100% Completo y Listo para Producción**

- ✅ Todos los controladores implementados
- ✅ Todas las rutas funcionando
- ✅ Autenticación JWT completa
- ✅ Middleware de seguridad
- ✅ Configuración Docker
- ✅ Variables de entorno configuradas
- ✅ Verificación automatizada

**¡El backend está listo para desplegar!**
