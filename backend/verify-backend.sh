#!/bin/bash

# Script de verificación del backend GymApp
echo "🔍 Verificando configuración del backend..."

# Verificar estructura de archivos
echo "📁 Verificando estructura de archivos..."

required_files=(
    "package.json"
    "src/server.js"
    "src/config/database.js"
    "src/controllers/authController.js"
    "src/controllers/dashboardController.js"
    "src/controllers/rutinasController.js"
    "src/controllers/ejerciciosController.js"
    "src/controllers/entrenamientosController.js"
    "src/routes/auth.js"
    "src/routes/dashboard.js"
    "src/routes/rutinas.js"
    "src/routes/ejercicios.js"
    "src/routes/entrenamientos.js"
    "src/middleware/auth.js"
    ".env.example"
    ".env.production"
    "Dockerfile"
    ".dockerignore"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -eq 0 ]]; then
    echo "✅ Todos los archivos requeridos están presentes"
else
    echo "❌ Archivos faltantes:"
    printf '%s\n' "${missing_files[@]}"
    exit 1
fi

# Verificar dependencias
echo "📦 Verificando dependencias..."
if [[ ! -f "package.json" ]]; then
    echo "❌ package.json no encontrado"
    exit 1
fi

required_deps=(
    "express"
    "cors"
    "helmet"
    "jsonwebtoken"
    "bcryptjs"
    "mysql2"
    "dotenv"
    "express-rate-limit"
)

for dep in "${required_deps[@]}"; do
    if ! grep -q "\"$dep\":" package.json; then
        echo "❌ Dependencia faltante: $dep"
        exit 1
    fi
done

echo "✅ Todas las dependencias están presentes"

# Verificar scripts en package.json
echo "📜 Verificando scripts..."
if ! grep -q '"start".*"node src/server.js"' package.json; then
    echo "❌ Script 'start' no configurado correctamente"
    exit 1
fi

echo "✅ Scripts configurados correctamente"

# Verificar configuración de Docker
echo "🐳 Verificando configuración Docker..."
if [[ ! -f "Dockerfile" ]]; then
    echo "❌ Dockerfile no encontrado"
    exit 1
fi

if ! grep -q "FROM node:" Dockerfile; then
    echo "❌ Dockerfile no configurado correctamente"
    exit 1
fi

echo "✅ Dockerfile configurado correctamente"

# Verificar variables de entorno
echo "⚙️ Verificando variables de entorno..."
required_env_vars=(
    "PORT"
    "DB_HOST"
    "DB_USER"
    "DB_PASSWORD"
    "DB_NAME"
    "JWT_SECRET"
    "NODE_ENV"
)

for var in "${required_env_vars[@]}"; do
    if ! grep -q "^$var=" .env.production; then
        echo "❌ Variable de entorno faltante en .env.production: $var"
        exit 1
    fi
done

echo "✅ Variables de entorno configuradas"

# Verificar sintaxis de JavaScript
echo "🔍 Verificando sintaxis de archivos..."
js_files=$(find src -name "*.js" -type f)
for file in $js_files; do
    if ! node -c "$file" 2>/dev/null; then
        echo "❌ Error de sintaxis en: $file"
        exit 1
    fi
done

echo "✅ Sintaxis de archivos JavaScript correcta"

echo "🎉 ¡Backend verificado exitosamente!"
echo "📋 El backend está listo para despliegue en producción"
