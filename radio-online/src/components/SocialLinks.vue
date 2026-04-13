<template>
    <v-container class="py-6">
        <div class="text-center mb-4">
            <h2 class="text-h5 font-weight-bold mb-1">🌐 Síguenos</h2>
            <p class="text-caption text-medium-emphasis">Encuéntranos en redes sociales</p>
        </div>

        <v-row justify="center" class="ga-3">
            <v-col v-for="link in socialLinks" :key="link.label" cols="auto">
                <v-btn
                    :color="link.color"
                    variant="tonal"
                    :prepend-icon="link.icon"
                    :href="link.url"
                    target="_blank"
                    rounded="lg"
                    size="large">
                    {{ link.label }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useAppConfig } from '@/utils/useAppConfig'

const { config } = useAppConfig()

const socialLinks = computed(() => [
    { label: 'Facebook', icon: 'mdi-facebook', color: 'blue',  url: config.value.facebook },
    { label: 'YouTube',  icon: 'mdi-youtube',  color: 'red',   url: config.value.youtube  },
    { label: 'Spotify',  icon: 'mdi-spotify',  color: 'green', url: config.value.spotify  },
].filter(l => !!l.url))
</script>
