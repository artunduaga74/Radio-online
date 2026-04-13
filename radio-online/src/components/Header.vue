<template>
  <v-app-bar app color="primary" elevation="4">
    <img :src="logo" alt="La Voz de Filadelfia" height="44" class="ml-3 mr-2" style="border-radius:6px" />
    <v-app-bar-title>
      <span class="header-title font-weight-bold">La Voz de Filadelfia</span>
    </v-app-bar-title>

    <template #append>
      <!-- Toggle modo oscuro -->
      <v-btn icon size="small" variant="text" color="white" class="mr-1" @click="toggleDark">
        <v-icon size="20">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
        </v-tooltip>
      </v-btn>

      <!-- Selector de color de tema -->
      <v-menu v-model="colorMenu" location="bottom end" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn icon size="small" variant="text" color="white" class="mr-1" v-bind="props">
            <v-icon size="20">mdi-palette</v-icon>
            <v-tooltip activator="parent" location="bottom">Color del tema</v-tooltip>
          </v-btn>
        </template>
        <v-card rounded="xl" elevation="8" width="200" class="pa-3">
          <div class="text-caption font-weight-bold mb-2 text-medium-emphasis">COLOR DEL TEMA</div>
          <div class="d-flex flex-wrap ga-2 justify-center">
            <v-btn
              v-for="p in PALETAS" :key="p.valor"
              icon size="36" rounded="lg"
              :style="{ backgroundColor: p.valor }"
              @click="setColor(p.valor)">
              <v-icon v-if="activeColor === p.valor" color="white" size="18">mdi-check</v-icon>
              <v-tooltip activator="parent" location="top">{{ p.nombre }}</v-tooltip>
            </v-btn>
          </div>
        </v-card>
      </v-menu>

      <!-- Botón admin: candado=sin sesión, escudo=admin activo -->
      <v-btn icon size="small" variant="text" color="white" class="mr-1"
        @click="isAdmin ? openPanel() : (loginDialog = true)">
        <v-icon size="20">{{ isAdmin ? 'mdi-shield-account' : 'mdi-lock' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ isAdmin ? 'Panel Admin' : 'Administrador' }}
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

      <v-card-text class="pb-0">
        <v-form ref="loginFormRef" @submit.prevent="handleEmailLogin">
          <v-text-field
            v-model="email"
            label="Correo electrónico"
            type="email"
            variant="outlined" density="compact"
            prepend-inner-icon="mdi-email"
            :rules="[v => !!v || 'Requerido']"
            class="mb-3"
            autocomplete="email" />

          <v-text-field
            v-model="password"
            label="Contraseña"
            :type="showPass ? 'text' : 'password'"
            variant="outlined" density="compact"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPass = !showPass"
            :rules="[v => !!v || 'Requerido']"
            autocomplete="current-password" />
        </v-form>

        <v-alert v-if="errorMsg" type="error" variant="tonal" density="compact" class="mt-2 mb-1">
          {{ errorMsg }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="flex-column pa-4 pt-2 ga-2">
        <v-btn color="primary" block rounded="lg" size="large"
          prepend-icon="mdi-login" :loading="loggingIn === 'email'" @click="handleEmailLogin">
          Entrar con correo
        </v-btn>

        <div class="d-flex align-center w-100 my-1">
          <v-divider /><span class="mx-2 text-caption text-medium-emphasis">o</span><v-divider />
        </div>

        <v-btn variant="tonal" block rounded="lg" size="large"
          prepend-icon="mdi-google" :loading="loggingIn === 'google'" @click="handleGoogleLogin">
          Entrar con Google
        </v-btn>

        <v-btn variant="text" block rounded="lg" @click="closeLogin">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <AdminPanel ref="adminPanelRef" />
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useAuth } from '@/utils/useAuth'
import { PALETAS, isDark, activeColor } from '@/utils/useThemeSettings'
import AdminPanel from './AdminPanel.vue'
import logo from '@/assets/logo blanco.png'

const { isAdmin, loginWithEmail, loginWithGoogle } = useAuth()
const theme      = useTheme()
const colorMenu  = ref(false)

// ── Tema ──
const applyTheme = () => {
  theme.global.name.value                    = isDark.value ? 'dark' : 'light'
  theme.themes.value.light.colors.primary    = activeColor.value
  theme.themes.value.dark.colors.primary     = activeColor.value
}

const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('darkMode', isDark.value)
  applyTheme()
}

const setColor = (color) => {
  activeColor.value = color
  localStorage.setItem('themeColor', color)
  applyTheme()
  colorMenu.value = false
}

// Aplicar al montar el Header
applyTheme()

// ── Login ──
const loginDialog  = ref(false)
const loggingIn    = ref('')
const email        = ref('')
const password     = ref('')
const showPass     = ref(false)
const errorMsg     = ref('')
const loginFormRef = ref(null)
const adminPanelRef = ref(null)

const openPanel  = () => adminPanelRef.value?.openDrawer()
const closeLogin = () => { loginDialog.value = false; errorMsg.value = ''; password.value = '' }

const onSuccess = () => {
  if (isAdmin.value) { closeLogin(); openPanel() }
  else errorMsg.value = 'Esta cuenta no tiene acceso de administrador.'
}

const handleEmailLogin = async () => {
  const { valid } = await loginFormRef.value.validate()
  if (!valid) return
  loggingIn.value = 'email'
  errorMsg.value  = ''
  try {
    await loginWithEmail(email.value.trim(), password.value)
    onSuccess()
  } catch {
    errorMsg.value = 'Correo o contraseña incorrectos.'
  } finally {
    loggingIn.value = ''
  }
}

const handleGoogleLogin = async () => {
  loggingIn.value = 'google'
  errorMsg.value  = ''
  try {
    await loginWithGoogle()
    onSuccess()
  } catch {
    errorMsg.value = 'No se pudo iniciar sesión con Google.'
  } finally {
    loggingIn.value = ''
  }
}
</script>

<style scoped>
.header-title {
  font-size: clamp(13px, 3.5vw, 17px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
