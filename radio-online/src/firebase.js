// src/firebase.js
import { initializeApp } from "firebase/app";
import { getPerformance } from "firebase/performance";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCOePpaVacfR5xnQOPGqMbcWvYNLMBqjWQ",
  authDomain: "filadelfia-b6238.firebaseapp.com",
  projectId: "filadelfia-b6238",
  storageBucket: "filadelfia-b6238.firebasestorage.app",
  messagingSenderId: "48149883887",
  appId: "1:48149883887:web:f7ba45751f712c81c5241a",
  measurementId: "G-DV7QMEM4C5" // necesario para performance
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
// Habilita Analizis de uso
const Analytics = getAnalytics(app);

// Habilita Performance Monitoring
const perf = getPerformance(app);

export { app, perf, Analytics };
