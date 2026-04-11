<template>
    <v-container class="py-6">
        <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold mb-1">🎙️ Catálogo de Episodios</h2>
            <p class="text-caption text-medium-emphasis">Episodios de La Voz de Filadelfia</p>
        </div>

        <!-- Cargando -->
        <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48" />
            <p class="mt-3 text-medium-emphasis">Cargando episodios...</p>
        </div>

        <!-- Sin episodios -->
        <v-alert v-else-if="episodes.length === 0" type="info" variant="tonal">
            Aún no hay episodios publicados.
        </v-alert>

        <!-- Lista de episodios -->
        <div v-else>
            <div v-for="(ep, i) in episodes" :key="ep.id" class="mb-3">

                <!-- Card del episodio -->
                <v-card
                    rounded="lg"
                    elevation="2"
                    :color="selectedId === ep.id ? 'primary' : undefined"
                    :variant="selectedId === ep.id ? 'tonal' : 'elevated'"
                    @click="toggleEpisode(ep)">

                    <div class="d-flex align-center pa-3 ga-3">

                        <!-- Ícono mic (actúa como play/pause) -->
                        <v-avatar
                            rounded="lg"
                            size="52"
                            :color="selectedId === ep.id ? 'primary' : 'primary'"
                            variant="tonal"
                            style="cursor:pointer; flex-shrink:0">
                            <v-icon
                                size="28"
                                :color="selectedId === ep.id ? 'primary' : 'primary'">
                                {{ selectedId === ep.id ? 'mdi-pause-circle' : 'mdi-microphone' }}
                            </v-icon>
                        </v-avatar>

                        <!-- Contenido -->
                        <div class="flex-grow-1 min-width-0">
                            <!-- Ep. N arriba a la derecha + fecha -->
                            <div class="d-flex align-center justify-space-between mb-1">
                                <span class="text-caption text-medium-emphasis">{{ ep.date }}</span>
                                <v-chip size="x-small" color="primary" variant="tonal">
                                    Ep. {{ episodes.length - i }}
                                </v-chip>
                            </div>
                            <!-- Título -->
                            <div class="text-body-2 font-weight-bold text-wrap">{{ ep.title }}</div>
                            <!-- Descripción -->
                            <div v-if="ep.description" class="text-caption text-medium-emphasis mt-1 text-truncate-2">
                                {{ ep.description }}
                            </div>
                        </div>

                    </div>
                </v-card>

                <!-- Player inline — aparece justo debajo del card seleccionado -->
                <v-expand-transition>
                    <div v-if="selectedId === ep.id" class="pt-2">
                        <!-- key fuerza recreación del iframe al cambiar episodio -->
                        <!-- autoplay=1 inicia reproducción automáticamente al abrir -->
                        <iframe
                            :key="ep.id"
                            style="border-radius:12px; display:block;"
                            :src="ep.embedUrl + '?autoplay=1&utm_source=generator'"
                            width="100%"
                            height="152"
                            frameborder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        </iframe>
                    </div>
                </v-expand-transition>

            </div>
        </div>
    </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase'
import { stopRadio, activeAudioSource } from '@/utils/audioManager'

const episodes = ref([])
const selectedId = ref(null)
const loading = ref(true)

// Cerrar episodio si la radio o el widget de Spotify (OnDemand) se activan
watch(activeAudioSource, (source) => {
    if (source === 'radio' || source === 'spotify') selectedId.value = null
})

// Toggle: click en un episodio lo abre; click de nuevo lo cierra
const toggleEpisode = (ep) => {
    if (selectedId.value === ep.id) {
        // Cerrar el episodio activo
        selectedId.value = null
    } else {
        // Abrir nuevo episodio y parar la radio
        stopRadio()
        selectedId.value = ep.id
    }
}

// Cargar episodios desde Firestore en tiempo real
let unsubscribe = null
onMounted(() => {
    const q = query(collection(db, 'episodes'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(q, (snap) => {
        episodes.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loading.value = false
    }, () => {
        loading.value = false
    })
})
onUnmounted(() => unsubscribe?.())
</script>

<style scoped>
.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.min-width-0 { min-width: 0; }
</style>
