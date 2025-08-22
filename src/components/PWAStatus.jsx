import { useState, useEffect } from 'react';
import { Smartphone, Download, Wifi, WifiOff } from 'lucide-react';

const PWAStatus = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Verificar si está instalada
    const checkInstalled = () => {
      const installed = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
      setIsInstalled(installed);
    };

    // Manejar estado online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Manejar prompt de instalación
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setShowInstallPrompt(true);
    };

    checkInstalled();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  

  if (showInstallPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start space-x-3">
            <Download className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">¡Instala GymApp!</h3>
              <p className="text-xs text-blue-100 mt-1">
                Accede más rápido y funciona sin conexión
              </p>
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={() => {
                    if (window.pwaHelper) {
                      window.pwaHelper.installApp();
                    }
                    setShowInstallPrompt(false);
                  }}
                  className="bg-white text-blue-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-50"
                >
                  Instalar
                </button>
                <button 
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-blue-100 px-3 py-1.5 rounded text-xs hover:text-white"
                >
                  Ahora no
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowInstallPrompt(false)}
              className="text-blue-200 hover:text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAStatus;
