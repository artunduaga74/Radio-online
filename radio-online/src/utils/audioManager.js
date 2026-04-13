import { ref } from 'vue';

// Estado global
// 'radio' | 'spotify' | 'himnario' | 'devocional' | null
export const activeAudioSource = ref(null);
export const isReconnecting = ref(false);

// ── Registro de callbacks de parada para cada fuente ──────────────
const _stopCallbacks = {};

/** Registra la función que detiene una fuente de audio */
export function registerStopCallback(source, fn) {
  _stopCallbacks[source] = fn;
}

/** Detiene todas las fuentes excepto la indicada */
export function stopAllExcept(source) {
  Object.keys(_stopCallbacks).forEach(s => {
    if (s !== source) _stopCallbacks[s]?.();
  });
  if (source !== 'radio') stopRadio();
}

// --- Radio ---
let audioInstance = null;
let currentStreamUrl = null;
let reconnectTimeout = null;

function scheduleReconnect() {
  if (reconnectTimeout) return;
  isReconnecting.value = true;
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    if (activeAudioSource.value === 'radio' && currentStreamUrl) {
      audioInstance.src = currentStreamUrl;
      audioInstance.play().catch(() => scheduleReconnect());
    }
  }, 5000);
}

export function playRadio(streamUrl) {
  currentStreamUrl = streamUrl;
  // Detener himnario/devocional si estaban sonando
  Object.keys(_stopCallbacks).forEach(s => _stopCallbacks[s]?.());
  activeAudioSource.value = 'radio';

  if (spotifyController) {
    spotifyController.pause();
  }

  if (!audioInstance) {
    audioInstance = new Audio();

    audioInstance.addEventListener('error', () => {
      if (activeAudioSource.value === 'radio') {
        scheduleReconnect();
      }
    });

    audioInstance.addEventListener('playing', () => {
      isReconnecting.value = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    });
  }

  audioInstance.src = streamUrl;
  audioInstance.play().catch(() => scheduleReconnect());
}

export function stopRadio() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  isReconnecting.value = false;

  if (audioInstance) {
    audioInstance.pause();
  }
  if (activeAudioSource.value === 'radio') {
    activeAudioSource.value = null;
  }
}

// --- Spotify ---
let spotifyController = null;

export function setSpotifyController(controller) {
  spotifyController = controller;

  spotifyController.addListener('playback_started', () => {
    activeAudioSource.value = 'spotify';
    stopRadio();
  });
}

export function setSpotifyAsActive() {
  activeAudioSource.value = 'spotify';
  stopRadio();
}
