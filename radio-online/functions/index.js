const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()

const db        = admin.firestore()
const messaging = admin.messaging()

// Llamada desde el Admin Panel para enviar notificación push a todos los suscriptores
exports.sendNotification = onCall(async (request) => {
  // Solo admin autenticado puede enviar
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes estar autenticado para enviar notificaciones.')
  }

  const { title, body } = request.data

  if (!title || !body) {
    throw new HttpsError('invalid-argument', 'Se requiere título y mensaje.')
  }

  // Obtener todos los tokens FCM guardados en Firestore
  const snapshot = await db.collection('fcm_tokens').get()
  const tokens   = snapshot.docs.map(d => d.id).filter(Boolean)

  if (tokens.length === 0) {
    return { sent: 0, failed: 0 }
  }

  const message = {
    notification: { title, body },
    webpush: {
      notification: {
        title,
        body,
        icon:    '/icono.png',
        badge:   '/icono.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      },
      fcmOptions: { link: '/' }
    },
    tokens
  }

  const response = await messaging.sendEachForMulticast(message)

  // Limpiar tokens inválidos automáticamente
  const invalidos = []
  response.responses.forEach((resp, idx) => {
    if (!resp.success) invalidos.push(tokens[idx])
  })

  if (invalidos.length > 0) {
    const batch = db.batch()
    invalidos.forEach(token => batch.delete(db.collection('fcm_tokens').doc(token)))
    await batch.commit()
  }

  return { sent: response.successCount, failed: response.failureCount }
})
