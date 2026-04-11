import { ref } from 'vue';

// Estado global (sigue igual)
export const activeAudioSource = ref(null);

// --- Radio ---
let audioInstance = null;

export function playRadio(streamUrl) {
  activeAudioSource.value = 'radio';
  // Detenemos Spotify usando su nuevo controlador
  if (spotifyController) {
    spotifyController.pause();
  }
  // ... resto de la lógica de la radio ...
  if (!audioInstance) {
    audioInstance = new Audio(streamUrl);
  }
  audioInstance.src = streamUrl;
  audioInstance.play();
}

export function stopRadio() {
  if (audioInstance) {
    audioInstance.pause();
  }
  if (activeAudioSource.value === 'radio') {
    activeAudioSource.value = null;
  }
}

// --- Spotify ---
// Nueva variable para guardar el controlador de la API
let spotifyController = null;

// Función para almacenar el controlador cuando esté listo
export function setSpotifyController(controller) {
  spotifyController = controller;

  // Escuchamos cuando el usuario da PLAY dentro del iframe
  spotifyController.addListener('playback_started', () => {
    console.log('Spotify ha comenzado a reproducir.');
    // Avisamos a la app y detenemos la radio
    activeAudioSource.value = 'spotify';
    stopRadio();
  });
}

// Función para que Spotify anuncie que quiere sonar
export function setSpotifyAsActive() {
  activeAudioSource.value = 'spotify';
  stopRadio(); // Detenemos la radio explícitamente
}