const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:saul.gf@icloud.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Aquí deberías guardar la suscripción en la base de datos por usuario
let subscriptions = [];

// Endpoint para guardar la suscripción push
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription); // Solo para demo, guarda en DB en producción
  res.status(201).json({ message: 'Suscripción guardada' });
});

// Endpoint para enviar notificación push (puedes llamarlo desde el frontend cuando termine el descanso)
router.post('/notify', async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });
  try {
    for (const sub of subscriptions) {
      await webpush.sendNotification(sub, payload);
    }
    res.json({ message: 'Notificación enviada' });
  } catch (error) {
    console.error('Error enviando push:', error);
    res.status(500).json({ message: 'Error enviando push' });
  }
});

module.exports = router;
