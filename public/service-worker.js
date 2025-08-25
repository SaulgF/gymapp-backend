// Timer en background
let timerInterval = null;
let timerEndTime = null;

console.log('Service Worker cargado');

self.addEventListener('message', function(event) {
  console.log('Service Worker recibió mensaje:', event.data);
  
  if (event.data.action === 'startTimer') {
    const duration = event.data.duration; // en segundos
    const rutinaId = event.data.rutinaId; // ID de la rutina actual
    console.log('Iniciando timer por', duration, 'segundos para rutina', rutinaId);
    
    timerEndTime = Date.now() + (duration * 1000);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      console.log('Timer anterior detenido');
    }
    
    timerInterval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
      
      // Enviar tiempo restante al frontend
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            action: 'timerUpdate',
            timeLeft: timeLeft
          });
        });
      });
      
      // Cuando termine el timer
      if (timeLeft === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log('Timer terminado');
        
        // Mostrar notificación con datos para abrir la app
        self.registration.showNotification('¡Descanso terminado!', {
          body: 'Es hora de continuar con tu siguiente ejercicio.',
          icon: '/gym/icons/icon-192x192.svg',
          badge: '/gym/icons/icon-72x72.svg',
          tag: 'timer-finished',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: {
            rutinaId: rutinaId,
            url: `/gym/entrenamientos/${rutinaId}`
          }
        });
        
        // Notificar al frontend que terminó
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              action: 'timerFinished'
            });
          });
        });
      }
    }, 1000);
  }
  
  if (event.data.action === 'stopTimer') {
    console.log('Deteniendo timer');
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
});

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'GymApp', {
      body: data.body || '¡Descanso terminado! Es hora de continuar.',
      icon: '/gym/icons/icon-192x192.svg',
      badge: '/gym/icons/icon-72x72.svg'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notificación clickeada:', event.notification.data);
  event.notification.close();
  
  // Obtener URL desde los datos de la notificación
  const urlToOpen = event.notification.data?.url || '/gym/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Si ya hay una ventana abierta, enfocarla y navegar
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/gym/') && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
