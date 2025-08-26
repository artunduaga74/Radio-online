<template>
  <v-container class="d-flex justify-center mt-8">
    <v-card class="player-card pa-4" elevation="6" width="250">

      <!-- Carátula del álbum -->
      <v-img :src="coverImage" class=" mx-auto mb-4" max-width="125" max-height="125" />

      <!-- Nombre de la canción -->
      <h3 class="text-center">{{ currentSong || 'Cargando audio...' }}</h3>
      <p class="text-center text-subtitle-2">{{ currentArtist || 'Cargando predicador...' }}</p>

      <!-- Controles -->
      <div class="d-flex justify-center align-center my-4">
        <v-btn icon @click="togglePlay" color="primary" class="mx-2" width="50" height="50">
          <v-icon v-if="!isPlaying">mdi-play-circle</v-icon>
          <v-icon v-else>mdi-pause-circle</v-icon>
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
</template>

<script setup>
import portadaLocal from '@/assets/icono.png'
import { ref, onMounted, onUnmounted } from 'vue'

// URL del stream
const defaultCentovaCover = "https://cast1.my-control-panel.com/static/nonefern/covers/nocover.png";
const defaultAppCover = portadaLocal;
const streamUrl = 'https://cast1.my-control-panel.com/proxy/nonefern/stream'
const audio = new Audio(streamUrl)
audio.crossOrigin = 'anonymous'
audio.volume = 0.8

// Estados
const isPlaying = ref(false)
const currentSong = ref('')
const currentArtist = ref('')
const coverImage = ref('') // Por defecto logo local

// URL de imagen por defecto en Firebase
const defaultCoverUrl = "https://firebasestorage.googleapis.com/v0/b/filadelfia-b6238.firebasestorage.app/o/filadelfia%20logo.https://firebasestorage.googleapis.com/v0/b/filadelfia-b6238.firebasestorage.app/o/filadelfia%20logo.png?alt=media&token=52376588-b1ec-4b13-9640-50d48d8af3f9"

// Funciones de control
const togglePlay = () => {
  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
  isPlaying.value = !isPlaying.value
}

const stop = () => {
  audio.pause()
  audio.currentTime = 0
  isPlaying.value = false
}

// Obtener metadatos de la canción
const fetchMetadata = async () => {
  try {
    const res = await fetch('https://cast1.asurahosting.com/rpc/nonefern/streaminfo.get')
    const json = await res.json()

    if (json.data && json.data.length > 0 && json.data[0].track) {
      const track = json.data[0].track
      currentSong.value = track.title || 'La Voz de filadelfia'
      currentArtist.value = track.artist || 'Tema Especial'

      // Verificar si la imagen es la genérica de Centova Cast
      if (!track.imageurl || track.imageurl === defaultCentovaCover) {
        coverImage.value = defaultAppCover;
      } else {
        coverImage.value = track.imageurl;
      }

      //consola para conocer el archivo json. Desactivar backslash
      //console.log({
      // json: track,
      // Canción: currentSong.value,
      // Artista: currentArtist.value,
      // Portada: coverImage.value
      //});
    }
  } catch (err) {
    console.error('Error obteniendo metadatos:', err)
    currentSong.value = 'No disponible'
    currentArtist.value = ''
    coverImage.value = defaultCoverUrl
  }
}

// Compartir la emisora
const shareStation = async () => {
  const shareData = {
    //title: 'La Voz de Filadelfia',
    text: 'Escucha la transmisión 📻 La Voz de Filadelfia.. ',
    url: window.location.origin
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
      console.log('Compartido con éxito')
    } catch (err) {
      console.error('Error al compartir:', err)
    }
  } else {
    // Fallback: copiar enlace al portapapeles
    try {
      await navigator.clipboard.writeText(shareData.url)
      alert('Enlace copiado al portapapeles 📋')
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err)
    }
  }
}

// Montar y refrescar datos
onMounted(() => {
  fetchMetadata()
  setInterval(fetchMetadata, 60000)
  onUnmounted(() => clearInterval(intervalId))

})
</script>

<style scoped>
.player-card {
  border-radius: 16px;
}
</style>
