<template>
    <v-container>
        <h2 class="text-center mb-4">🎙️ Catálogo de Podcasts</h2>

        <v-row>
            <v-col v-for="(podcast, i) in podcasts" :key="i" cols="12" md="6">
                <v-card class="mb-4" outlined>
                    <v-card-title>{{ podcast.title }}</v-card-title>
                    <v-card-subtitle>{{ podcast.description }}</v-card-subtitle>
                    <v-card-actions>
                        <v-btn color="primary" @click="selectedPodcast = podcast">
                            Escuchar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Reproductor dinámico -->
        <div v-if="selectedPodcast">
            <h3 class="mt-6">{{ selectedPodcast.title }}</h3>
            <iframe style="border-radius:12px" :src="selectedPodcast.embedUrl" width="100%" height="232" frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
            </iframe>
        </div>
    </v-container>
</template>
<script setup>
import { ref } from "vue"

const podcasts = ref([
    {
        title: "Episodio 1 - Introducción",
        description: "Una bienvenida a nuestro programa.",
        embedUrl: "https://open.spotify.com/embed/episode/0wm6dVuMA8ENkYElBFS1tv?si=KsCOrypvSg6hDuvsDyLtxA" // enlace de Spotify
    },
    {
        title: "Episodio 2 - Tema Profético",
        description: "Exploramos Apocalipsis 12.",
        embedUrl: "https://open.spotify.com/embed/episode/2PBfZJgbYcVcq8BoggYyOR?si=LI72asY2QoWTuemyHGfItA"
    }
])

const selectedPodcast = ref(null)
</script>