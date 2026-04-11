<template>
    <v-container class="py-6">
        <div class="section-header text-center mb-4">
            <v-chip color="primary" variant="tonal" prepend-icon="mdi-spotify" size="large">
                Escuchar en Spotify
            </v-chip>
        </div>
        <!-- Capa transparente encima del iframe detecta el primer clic y para otros audios -->
        <div style="position:relative;">
            <div
                style="position:absolute; inset:0; z-index:1; cursor:pointer;"
                @click="handleClick" />
            <iframe
                style="border-radius:12px; position:relative;"
                src="https://open.spotify.com/embed/show/4VZFQ816UPQzJfhEPAIqEH?utm_source=generator"
                width="100%"
                height="232"
                frameBorder="0"
                allowfullscreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy">
            </iframe>
        </div>
        <p class="text-center text-caption mt-2 text-medium-emphasis">
            El widget se actualiza automáticamente con cada episodio nuevo.
        </p>
    </v-container>
</template>

<script setup>
import { setSpotifyAsActive } from '@/utils/audioManager'

// Al primer clic sobre el widget, avisar al audioManager para detener radio y episodios abiertos
const handleClick = (e) => {
    setSpotifyAsActive()
    // Remover la capa después del primer clic para que el widget sea interactivo normalmente
    e.currentTarget.style.display = 'none'
}
</script>
