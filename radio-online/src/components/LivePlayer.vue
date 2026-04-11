<template>
  <v-container class="d-flex justify-center mt-8">
    <v-card class="player-card pa-4" elevation="6" width="250">

      <!-- Carátula del álbum -->
      <v-img :src="coverImage" class="mx-auto mb-4" max-width="125" max-height="125" />

      <!-- Nombre de la canción -->
      <h3 class="text-center">{{ currentSong || 'Cargando audio...' }}</h3>
      <p class="text-center text-subtitle-2">{{ currentArtist || 'Cargando predicador...' }}</p>

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
</template>


<script setup>
// Importamos el estado global y las funciones del manager
import { computed } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue';
// Importamos el estado global del audio
import { activeAudioSource, playRadio, stopRadio } from '@/utils/audioManager'
// Importamos el icono para los nocovers de asurahosting
import portadaLocal from '@/assets/icono.png'

// Configuración radio asignar portada default
const defaultCentovaCover = "https://cast1.asurahosting.com/static/nonefern/covers/nocover.png";
const defaultAppCover = portadaLocal;
// Cargando el stream de radio 
const streamUrl = 'https://cast1.my-control-panel.com/proxy/nonefern/stream'
//----administrar audio global-----//

// Estados
// cambieré este codigo isplaying = ref(false) x este const isPlaying = computed(() => activeAudioSource.value === 'radio');
const isPlaying = computed(() => activeAudioSource.value === 'radio');
const currentSong = ref('')
const currentArtist = ref('')
const coverImage = ref(defaultAppCover)

// Funciones de control de audio play
const togglePlay = () => {
  if (isPlaying.value) {
    // Llama a la función del manager
    stopRadio();
  } else {
    // Llama a la función del manager
    playRadio(streamUrl);
  }
};

// Obtener metadatos
const fetchMetadata = async () => {
  try {
    const res = await fetch('https://cast1.asurahosting.com/rpc/nonefern/streaminfo.get')
    const json = await res.json()

    if (json.data?.[0]?.track) {
      const track = json.data[0].track
      currentSong.value = track.title || 'La Voz de Filadelfia'
      currentArtist.value = track.artist || 'Tema Especial'

      if (!track.imageurl || track.imageurl === defaultCentovaCover) {
        coverImage.value = defaultAppCover;
      } else {
        coverImage.value = track.imageurl;
      }
    }
  } catch (err) {
    console.error('Error obteniendo metadatos:', err)
    currentSong.value = 'No disponible'
    currentArtist.value = ''
    coverImage.value = defaultAppCover
  }
}

// Compartir la emisora
const shareStation = async () => {
  const shareData = {
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
    try {
      await navigator.clipboard.writeText(shareData.url)
      alert('Enlace copiado al portapapeles 📋')
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err)
    }
  }
}

// Montar y refrescar datos
let intervalId
onMounted(() => {
  fetchMetadata()
  onMounted(() => {
    fetchMetadata()

    setInterval(fetchMetadata, 60000)

    onUnmounted(() => clearInterval(intervalId))

  })
})
</script>

<style scoped>
.player-card {
  border-radius: 16px;
}
</style>
