// Service Worker para GymApp PWA
const CACHE_NAME = 'gymapp-v1.0.0'
const STATIC_CACHE = 'gymapp-static-v1'
const DYNAMIC_CACHE = 'gymapp-dynamic-v1'

// Archivos estáticos a cachear
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/vite.svg'
]

// Rutas de la aplicación para cachear
const APP_ROUTES = [
  '/',
  '/login',
  '/dashboard',
  '/rutinas',
  '/ejercicios',
  '/entrenamientos'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error)
      })
  )
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Manejar requests de la aplicación
  if (url.origin === location.origin) {
    event.respondWith(cacheFirstStrategy(request))
  }
  // Manejar requests de API
  else if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request))
  }
  // Otros recursos
  else {
    event.respondWith(staleWhileRevalidateStrategy(request))
  }
})

// Estrategia: Cache First (para archivos estáticos)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    
    // Cachear la respuesta si es exitosa
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Si falla la red, intentar servir página offline
    if (request.destination === 'document') {
      const cachedResponse = await caches.match('/')
      return cachedResponse || new Response('App offline', { status: 503 })
    }
    throw error
  }
}

// Estrategia: Network First (para API)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cachear respuesta de API si es GET y exitosa
    if (request.method === 'GET' && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Si falla la red, intentar cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Respuesta de fallback para API
    return new Response(JSON.stringify({ 
      error: 'Sin conexión', 
      message: 'No hay conexión a internet'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Estrategia: Stale While Revalidate (para otros recursos)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

// Push notifications (futuro)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received')
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de GymApp',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/icon-72x72.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('GymApp', options)
  )
})

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/dashboard'))
  }
})

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implementar sincronización de datos offline
  console.log('Service Worker: Performing background sync')
}
