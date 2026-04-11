// src/firebase.js
import { initializeApp } from "firebase/app"
import { getPerformance } from "firebase/performance"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCOePpaVacfR5xnQOPGqMbcWvYNLMBqjWQ",
  authDomain: "filadelfia-b6238.firebaseapp.com",
  projectId: "filadelfia-b6238",
  storageBucket: "filadelfia-b6238.firebasestorage.app",
  messagingSenderId: "48149883887",
  appId: "1:48149883887:web:f7ba45751f712c81c5241a",
  measurementId: "G-DV7QMEM4C5"
}

const app = initializeApp(firebaseConfig)

export const analytics = getAnalytics(app)
export const perf = getPerformance(app)
export const auth = getAuth(app)
export const db = getFirestore(app)

export { app }
