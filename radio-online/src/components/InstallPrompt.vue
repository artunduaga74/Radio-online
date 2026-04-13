<template>
  <!-- Solo mostrar si hay algo que ofrecer y el usuario no lo descartó -->
  <v-slide-y-reverse-transition>
    <div v-if="visible" class="install-prompt">

      <!-- Fila: ícono + texto + cerrar -->
      <div class="install-prompt__top">
        <img src="/logo-redondo.png" alt="logo" class="install-prompt__logo" />
        <div class="install-prompt__text">
          <div class="install-prompt__title">La Voz de Filadelfia</div>
          <div class="install-prompt__sub">Radio cristiana siempre contigo</div>
        </div>
        <v-btn icon size="x-small" variant="text" color="white" @click="dismiss">
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Botones de acción -->
      <div class="install-prompt__actions">

        <!-- Instalar PWA -->
        <v-btn
          v-if="canInstall"
          size="small" variant="flat" color="white"
          prepend-icon="mdi-cellphone-arrow-down"
          class="install-prompt__btn install-prompt__btn--install"
          :loading="installing"
          @click="installApp">
          Instalar app
        </v-btn>

        <!-- Notificaciones -->
        <v-btn
          v-if="canNotify"
          size="small" variant="outlined" color="white"
          prepend-icon="mdi-bell-outline"
          class="install-prompt__btn"
          :loading="subscribing"
          @click="enableNotifications">
          Activar avisos
        </v-btn>

      </div>

    </div>
  </v-slide-y-reverse-transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { requestNotificationPermission, listenForegroundNotifications } from '@/utils/usePushNotifications'

const canInstall   = ref(false)
const canNotify    = ref(false)
const dismissed    = ref(false)
const installing   = ref(false)
const subscribing  = ref(false)

let deferredPrompt = null

const visible = computed(() =>
  !dismissed.value && (canInstall.value || canNotify.value)
)

const dismiss = () => {
  dismissed.value = true
  sessionStorage.setItem('install_prompt_dismissed', '1')
}

onMounted(() => {
  // No mostrar si el usuario ya lo descartó en esta sesión
  if (sessionStorage.getItem('install_prompt_dismissed')) return

  // Detectar si la PWA ya está instalada
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true

  // Capturar el evento de instalación del navegador
  if (!isInstalled) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      canInstall.value = true
    })

    // Si ya está instalado, beforeinstallprompt no se dispara
    window.addEventListener('appinstalled', () => {
      canInstall.value = false
      deferredPrompt = null
    })
  }

  // Verificar estado de notificaciones
  if ('Notification' in window && Notification.permission === 'default') {
    canNotify.value = true
  }
})

const installApp = async () => {
  if (!deferredPrompt) return
  installing.value = true
  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      canInstall.value = false
      deferredPrompt = null
      if (!canNotify.value) dismiss()
    }
  } finally {
    installing.value = false
  }
}

const enableNotifications = async () => {
  subscribing.value = true
  try {
    const ok = await requestNotificationPermission()
    if (ok) {
      listenForegroundNotifications()
      canNotify.value = false
      if (!canInstall.value) dismiss()
    } else {
      // El usuario negó — no volver a preguntar
      canNotify.value = false
      dismiss()
    }
  } finally {
    subscribing.value = false
  }
}
</script>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 66px;
  left: 12px;
  right: 12px;
  z-index: 800;
  background: linear-gradient(135deg,
    rgb(var(--v-theme-primary)),
    color-mix(in srgb, rgb(var(--v-theme-primary)) 80%, #000));
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
}

.install-prompt__top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.install-prompt__logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}

.install-prompt__text {
  flex: 1;
  min-width: 0;
}
.install-prompt__title {
  font-size: 13px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}
.install-prompt__sub {
  font-size: 11px;
  color: rgba(255,255,255,0.75);
}

.install-prompt__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.install-prompt__btn {
  font-size: 12px !important;
  font-weight: 600 !important;
}
.install-prompt__btn--install {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
