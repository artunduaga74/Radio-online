<template>
  <v-container class="d-flex justify-center">
    <v-card class="player-card pa-4" elevation="6" width="280">

      <!-- Badge EN VIVO / RECONECTANDO -->
      <div class="d-flex justify-center mb-2">
        <v-chip v-if="isReconnecting" color="warning" size="small" prepend-icon="mdi-refresh">
          Reconectando...
        </v-chip>
        <v-chip v-else-if="isPlaying" color="error" size="small" prepend-icon="mdi-broadcast">
          AL AIRE
        </v-chip>
        <v-chip v-else color="grey" size="small" prepend-icon="mdi-broadcast-off">
          FUERA DE AIRE
        </v-chip>
      </div>

      <!-- Carátula del álbum -->
      <v-img :src="coverImage" class="mx-auto mb-4" max-width="125" max-height="125" />

      <!-- Nombre de la canción -->
      <h3 class="text-center">{{ currentSong || 'La Voz de Filadelfia' }}</h3>
      <p class="text-center text-subtitle-2">{{ currentArtist || 'Tema Especial' }}</p>

      <!-- Controles -->
      <div class="d-flex justify-center align-center my-4">
        <v-btn icon @click="togglePlay" color="primary" class="mx-2" width="50" height="50">
          <img v-if="!isPlaying" src="@/assets/icons/play.svg" alt="Play" width="40" height="40" />
          <img v-else src="@/assets/icons/pause.svg" alt="Pause" width="40" height="40" />
        </v-btn>
        <v-btn icon @click="stop" color="error" class="mx-2">
          <v-icon>mdi-stop-circle</v-icon>
        </v-btn>
      </div>

      <!-- Botón de compartir -->
      <div class="d-flex justify-center">
        <v-btn color="secondary" @click="shareStation" rounded>
          <v-icon start>mdi-share-variant</v-icon> Compartir
        </v-btn>
      </div>

    </v-card>
  </v-container>

  <!-- Snackbar para notificaciones -->
  <v-snackbar v-model="snackbar" :timeout="3000" location="bottom">
    {{ snackbarMsg }}
    <template #actions>
      <v-btn color="white" variant="text" @click="snackbar = false">Cerrar</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { activeAudioSource, playRadio, stopRadio, isReconnecting } from '@/utils/audioManager'
import portadaLocal from '@/assets/icono.png'

const defaultCentovaCover = "https://cast1.asurahosting.com/static/nonefern/covers/nocover.png"
const defaultAppCover = portadaLocal
const streamUrl = 'https://cast1.my-control-panel.com/proxy/nonefern/stream'

// Estado del reproductor
const isPlaying = computed(() => activeAudioSource.value === 'radio')
const currentSong = ref('')
const currentArtist = ref('')
const coverImage = ref(defaultAppCover)
const snackbar = ref(false)
const snackbarMsg = ref('')

// Mostrar notificación
const notify = (msg) => {
  snackbarMsg.value = msg
  snackbar.value = true
}

// Controles de audio
const togglePlay = () => {
  if (isPlaying.value) {
    stopRadio()
  } else {
    playRadio(streamUrl)
  }
}

const stop = () => stopRadio()

// Obtener metadatos del stream
const fetchMetadata = async () => {
  try {
    const res = await fetch('https://cast1.asurahosting.com/rpc/nonefern/streaminfo.get')
    const json = await res.json()
    if (json.data?.[0]?.track) {
      const track = json.data[0].track
      currentSong.value = track.title || 'La Voz de Filadelfia'
      currentArtist.value = track.artist || 'Tema Especial'
      coverImage.value = (!track.imageurl || track.imageurl === defaultCentovaCover)
        ? defaultAppCover
        : track.imageurl
    }
  } catch {
    currentSong.value = 'La Voz de Filadelfia'
    currentArtist.value = ''
    coverImage.value = defaultAppCover
  }
}

// Compartir la emisora
const shareStation = async () => {
  const shareData = {
    text: 'Escucha la transmisión 📻 La Voz de Filadelfia..',
    url: window.location.origin
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch {
      // El usuario canceló el diálogo — no hacer nada
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.url)
      notify('Enlace copiado al portapapeles 📋')
    } catch {
      notify('No se pudo copiar el enlace')
    }
  }
}

// Ciclo de vida corregido
let intervalId = null

onMounted(() => {
  fetchMetadata()
  intervalId = setInterval(fetchMetadata, 30000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.player-card {
  border-radius: 16px;
}
</style>
