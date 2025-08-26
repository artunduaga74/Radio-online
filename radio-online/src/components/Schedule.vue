<template>
    <v-container class="py-2">
        <h3 class="text-center">Programación Diaria</h3>
        <v-timeline>
            <v-timeline-item v-for="item in schedule" :key="item.time" :dot-color="'primary'">
                <template #opposite>{{ item.time }}</template>
                {{ item.program }}
            </v-timeline-item>
        </v-timeline>
    </v-container>
</template>
<script setup>
const schedule = [
    { time: '05:00 AM', program: 'Reflexión Matutina' },
    { time: '07:00 AM', program: 'Alabanzas' },
    { time: '07:30 AM', program: 'Salud Plena' },
    { time: '08:30 AM', program: 'Temas Variados' },
    { time: '08:00 PM', program: 'Estudios Proféticos' },
];
</script>

<style scoped></style>