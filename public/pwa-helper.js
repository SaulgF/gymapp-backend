// PWA Helper - Funciones adicionales para mejorar la experiencia
class PWAHelper {
  constructor() {
    this.installPrompt = null;
    this.init();
  }

  init() {
    this.setupInstallPrompt();
    this.setupUpdateNotification();
    this.setupOfflineNotification();
  }

  // Manejar prompt de instalación personalizado
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevenir que Chrome muestre el prompt automáticamente
      e.preventDefault();
      this.installPrompt = e;
      
      // Mostrar botón de instalación personalizado
      this.showInstallButton();
    });

    // Detectar cuando la app fue instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente');
      this.hideInstallButton();
      this.showWelcomeMessage();
    });
  }

  // Mostrar botón de instalación
  showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18l9-9-2.5-2.5L12 13l-6.5-6.5L3 9l9 9z"></path>
      </svg>
      Instalar App
    `;
    installBtn.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center font-medium z-50 hover:bg-blue-700 transition-colors';
    
    installBtn.addEventListener('click', () => {
      this.installApp();
    });

    document.body.appendChild(installBtn);
  }

  // Instalar la aplicación
  async installApp() {
    if (!this.installPrompt) return;

    try {
      this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('Usuario aceptó instalar la PWA');
      } else {
        console.log('Usuario rechazó instalar la PWA');
      }
      
      this.installPrompt = null;
    } catch (error) {
      console.error('Error al instalar PWA:', error);
    }
  }

  // Ocultar botón de instalación
  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.remove();
    }
  }

  // Mostrar mensaje de bienvenida
  showWelcomeMessage() {
    this.showNotification('¡Bienvenido a GymApp! 🎉', 'La aplicación se ha instalado correctamente.', 'success');
  }

  // Manejar actualizaciones del service worker
  setupUpdateNotification() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.showNotification(
          'Actualización disponible 🔄', 
          'La aplicación se ha actualizado. Reinicia para ver los cambios.',
          'info',
          () => window.location.reload()
        );
      });
    }
  }

  // Notificar cuando la app está offline
  setupOfflineNotification() {
    window.addEventListener('online', () => {
      this.showNotification('¡Conectado! 🌐', 'La conexión se ha restablecido.', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('Sin conexión 📱', 'Trabajando en modo offline.', 'warning');
    });
  }

  // Sistema de notificaciones personalizadas
  showNotification(title, message, type = 'info', action = null) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 max-w-sm bg-white border-l-4 p-4 shadow-lg rounded-lg z-50 transform transition-transform duration-300 translate-x-full`;
    
    const colors = {
      success: 'border-green-500 bg-green-50',
      error: 'border-red-500 bg-red-50', 
      warning: 'border-yellow-500 bg-yellow-50',
      info: 'border-blue-500 bg-blue-50'
    };
    
    notification.className += ` ${colors[type]}`;
    
    notification.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          ${this.getNotificationIcon(type)}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">${title}</p>
          <p class="text-sm text-gray-600">${message}</p>
          ${action ? '<button class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">Actualizar</button>' : ''}
        </div>
        <div class="ml-auto pl-3">
          <button class="inline-flex text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Agregar acción si se proporcionó
    if (action) {
      const actionBtn = notification.querySelector('button:last-of-type');
      if (actionBtn) {
        actionBtn.addEventListener('click', action);
      }
    }
  }

  getNotificationIcon(type) {
    const icons = {
      success: '<svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
      error: '<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
      warning: '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
      info: '<svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
    };
    return icons[type] || icons.info;
  }

  // Verificar si la app está instalada
  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
  }

  // Solicitar permisos para notificaciones
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Enviar notificación push local
  sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        ...options
      });
    }
  }
}

// Inicializar PWA Helper cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.pwaHelper = new PWAHelper();
});

// Exportar para uso global
window.PWAHelper = PWAHelper;
