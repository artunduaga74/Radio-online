<template>
  <v-app>
    <Header />

    <v-main>

      <!-- ── INICIO ── -->
      <div v-show="page === 'inicio'">

        <!-- Versículo del día -->
        <VerseOfDay />

        <v-divider />
        <section class="section-alt">
          <LivePlayer />
        </section>

        <v-divider />
        <section>
          <OnDemand />
        </section>

        <v-divider />
        <section class="section-alt">
          <PodcastCatalog />
        </section>

        <!-- Programación: deshabilitada temporalmente hasta tener horario fijo
        <v-divider />
        <section>
          <Schedule />
        </section>
        -->

        <v-divider />
        <section>
          <SocialLinks />
        </section>

        <!-- Contacto/mensajes: deshabilitado temporalmente
        <v-divider />
        <section class="section-alt">
          <ContactSection />
        </section>
        -->

        <v-divider />
        <FooterSection />
      </div>

      <!-- ── HIMNARIO ── -->
      <div v-show="page === 'himnario'">
        <HymnList />
      </div>

      <!-- ── DEVOCIONAL ── -->
      <div v-show="page === 'devocional'">
        <DevotionalList />
      </div>

    </v-main>

    <!-- Botón flotante WhatsApp -->
    <WhatsAppButton />

    <!-- Banner instalar app + notificaciones -->
    <InstallPrompt />

    <!-- Barra de navegación inferior -->
    <v-bottom-navigation v-model="page" color="primary" grow>
      <v-btn value="inicio">
        <v-icon>mdi-home</v-icon>
        Inicio
      </v-btn>
      <v-btn value="himnario">
        <v-icon>mdi-book-music</v-icon>
        Himnario
      </v-btn>
      <v-btn value="devocional">
        <v-icon>mdi-book-open-variant</v-icon>
        Devocional
      </v-btn>
    </v-bottom-navigation>

  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { listenForegroundNotifications } from '@/utils/usePushNotifications'
import Header        from './components/Header.vue'
import LivePlayer    from './components/LivePlayer.vue'
import OnDemand      from './components/OnDemand.vue'
import PodcastCatalog from './components/podcast.vue'
import Schedule      from './components/Schedule.vue'
import SocialLinks   from './components/SocialLinks.vue'
import ContactSection from './components/ContactSection.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
import FooterSection from './components/FooterSection.vue'
import HymnList       from './components/HymnList.vue'
import VerseOfDay     from './components/VerseOfDay.vue'
import DevotionalList from './components/DevotionalList.vue'
import InstallPrompt  from './components/InstallPrompt.vue'

const page = ref('inicio')

// Scroll al tope al cambiar de sección
watch(page, () => window.scrollTo({ top: 0, behavior: 'smooth' }))

onMounted(() => {
  // Escuchar notificaciones en primer plano si ya tiene permiso
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    listenForegroundNotifications()
  }
})
</script>

<style>
.section-alt {
  background: rgba(var(--v-theme-primary), 0.03);
}
</style>
