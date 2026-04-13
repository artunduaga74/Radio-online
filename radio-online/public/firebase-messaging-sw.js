// Service Worker para notificaciones push en segundo plano
// Firebase Messaging — La Voz de Filadelfia

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyCOePpaVacfR5xnQOPGqMbcWvYNLMBqjWQ',
  authDomain:        'filadelfia-b6238.firebaseapp.com',
  projectId:         'filadelfia-b6238',
  storageBucket:     'filadelfia-b6238.firebasestorage.app',
  messagingSenderId: '48149883887',
  appId:             '1:48149883887:web:f7ba45751f712c81c5241a',
})

const messaging = firebase.messaging()

// Se ejecuta cuando llega una notificación y la app está en SEGUNDO PLANO o cerrada
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {}
  if (!title) return

  self.registration.showNotification(title, {
    body,
    icon:  '/icono.png',
    badge: '/icono.png',
    vibrate: [200, 100, 200],
  })
})
