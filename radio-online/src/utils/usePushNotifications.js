// src/utils/usePushNotifications.js
// Maneja suscripción a notificaciones push con Firebase Cloud Messaging

import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { app, db } from '@/firebase'

// ⚠️  REEMPLAZA con tu clave VAPID de Firebase Console
// Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
const VAPID_KEY = 'BFYfEyLeBYxvE2JiUr51lIUeQofqofj---2QhdNwJM4VM4kH1gHbfk7PlzyCTABEAP-QRgf68eTUeonImTKnwWE'

/**
 * Solicita permiso de notificaciones, obtiene el token FCM
 * y lo guarda en Firestore para poder enviarle notificaciones.
 * Retorna true si se suscribió correctamente.
 */
export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return false

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })

    if (!token) return false

    // Guardar token en Firestore (la clave es el token mismo para evitar duplicados)
    await setDoc(doc(db, 'fcm_tokens', token), {
      suscrito:   new Date().toISOString(),
      userAgent:  navigator.userAgent,
    })

    return true
  } catch (err) {
    // Si el usuario bloqueó o hay error, no romper la app
    console.warn('[FCM] No se pudo suscribir a notificaciones:', err.message)
    return false
  }
}

/**
 * Escucha notificaciones cuando la app está en PRIMER PLANO.
 * (Las notificaciones en segundo plano las maneja firebase-messaging-sw.js)
 */
export function listenForegroundNotifications() {
  if (!('Notification' in window)) return
  const messaging = getMessaging(app)

  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification ?? {}
    if (title && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icono.png' })
    }
  })
}
