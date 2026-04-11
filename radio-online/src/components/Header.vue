<template>
  <v-app-bar app color="primary" elevation="4">
    <img :src="logo" alt="La Voz de Filadelfia" height="44" class="ml-3 mr-2" style="border-radius:6px" />
    <v-app-bar-title>
      <span class="text-body-1 font-weight-bold">📻 La Voz de Filadelfia</span>
    </v-app-bar-title>

    <template #append>
      <!-- Candado: cerrado = no autenticado, abierto = autenticado como admin -->
      <v-btn
        icon
        size="small"
        variant="text"
        color="white"
        class="mr-1"
        @click="isAdmin ? (showAdminPanel = true) : handleAdminClick()">
        <v-icon size="20">{{ isAdmin ? 'mdi-lock-open' : 'mdi-lock' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ isAdmin ? 'Panel Admin (' + user.displayName + ')' : 'Administrador' }}
        </v-tooltip>
      </v-btn>
    </template>
  </v-app-bar>

  <!-- Diálogo de login -->
  <v-dialog v-model="loginDialog" max-width="340" persistent>
    <v-card rounded="xl" class="pa-2">
      <v-card-title class="text-center pt-4">
        <v-icon size="40" color="primary">mdi-shield-account</v-icon>
        <div class="text-h6 mt-2">Acceso administrador</div>
      </v-card-title>
      <v-card-text class="text-center text-body-2 text-medium-emphasis">
        Inicia sesión con tu cuenta de Google para gestionar los episodios.
      </v-card-text>
      <v-card-actions class="flex-column pa-4 pt-0 ga-2">
        <v-btn
          color="primary"
          block
          rounded="lg"
          size="large"
          prepend-icon="mdi-google"
          :loading="loggingIn"
          @click="handleLogin">
          Entrar con Google
        </v-btn>
        <v-btn
          variant="text"
          block
          rounded="lg"
          @click="loginDialog = false">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Panel admin (se activa desde header o botón flotante) -->
  <AdminPanel v-model:open="showAdminPanel" />
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/utils/useAuth'
import AdminPanel from './AdminPanel.vue'
import logo from '@/assets/logo blanco.png'

const { user, isAdmin, login } = useAuth()
const loginDialog = ref(false)
const loggingIn = ref(false)
const showAdminPanel = ref(false)

const handleAdminClick = () => {
  loginDialog.value = true
}

const handleLogin = async () => {
  loggingIn.value = true
  try {
    await login()
    loginDialog.value = false
    if (isAdmin.value) showAdminPanel.value = true
  } catch (e) {
    // Usuario canceló o no es admin
  } finally {
    loggingIn.value = false
  }
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
