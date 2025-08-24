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
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/gym/')
  );
});
