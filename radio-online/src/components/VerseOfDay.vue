<template>
  <v-container class="py-4">
    <v-card rounded="xl" elevation="2" class="verse-card overflow-hidden">

      <!-- Franja de color superior -->
      <div class="verse-header px-5 pt-4 pb-3 d-flex align-center ga-3">
        <v-icon color="white" size="28">mdi-book-open-page-variant</v-icon>
        <div>
          <div class="text-caption text-white opacity-80 font-weight-medium" style="letter-spacing:1px">
            VERSÍCULO DEL DÍA
          </div>
          <div class="text-caption text-white opacity-70">{{ fechaHoy }}</div>
        </div>
      </div>

      <!-- Texto del versículo -->
      <v-card-text class="px-5 py-4">
        <p class="text-body-1 font-italic mb-3" style="line-height:1.7">
          "{{ verso.texto }}"
        </p>
        <p class="text-body-2 font-weight-bold text-primary">— {{ verso.ref }}</p>
      </v-card-text>

    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { VERSOS } from '@/data/versos'

const hoy = new Date()

const fechaHoy = computed(() =>
  hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
)

// Rota por día del año — con 366 versículos, cada fecha del calendario
// tiene siempre su mismo versículo y no se repite en todo el año
const diaDelAnio = Math.floor(
  (hoy - new Date(hoy.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
)
const verso = VERSOS[diaDelAnio % VERSOS.length]
</script>

<style scoped>
.verse-header {
  background: rgb(var(--v-theme-primary));
}
</style>
