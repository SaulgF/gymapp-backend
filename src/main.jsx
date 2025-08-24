import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar service worker para notificaciones push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/gym/service-worker.js')
      .then(reg => {
        console.log('Service Worker registrado:', reg);
      })
      .catch(err => {
        console.error('Error registrando Service Worker:', err);
      });
  });
}
