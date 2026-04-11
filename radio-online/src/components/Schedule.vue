<template>
    <v-container class="py-6">
        <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold mb-1">📅 Programación Diaria</h2>
            <p class="text-caption text-medium-emphasis">Horario de transmisión en vivo</p>
        </div>

        <v-timeline side="end" density="compact">
            <v-timeline-item
                v-for="item in schedule"
                :key="item.time"
                dot-color="primary"
                size="small">
                <template #opposite>
                    <span class="text-body-2 font-weight-bold text-primary">{{ item.time }}</span>
                </template>
                <v-card rounded="lg" elevation="1" class="pa-3">
                    <div class="d-flex align-center ga-2">
                        <v-icon :icon="item.icon" color="primary" size="20" />
                        <span class="text-body-2 font-weight-medium">{{ item.program }}</span>
                    </div>
                </v-card>
            </v-timeline-item>
        </v-timeline>
    </v-container>
</template>

<script setup>
const schedule = [
    { time: '05:00 AM', program: 'Reflexión Matutina',   icon: 'mdi-weather-sunset-up' },
    { time: '07:00 AM', program: 'Alabanzas',             icon: 'mdi-music-note' },
    { time: '07:30 AM', program: 'Salud Plena',           icon: 'mdi-heart-pulse' },
    { time: '08:30 AM', program: 'Temas Variados',        icon: 'mdi-radio' },
    { time: '08:00 PM', program: 'Estudios Proféticos',   icon: 'mdi-book-open-page-variant' },
]
</script>

<style scoped></style>
