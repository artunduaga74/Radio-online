<template>
  <v-app>
    <Header />

    <!-- v-main empuja el contenido bajo el app-bar automáticamente -->
    <v-main>

      <!-- Player en vivo -->
      <section class="section-alt">
        <LivePlayer />
      </section>

      <!-- Podcasts: widget Spotify + catálogo -->
      <v-divider />
      <section>
        <OnDemand />
      </section>

      <v-divider />
      <section class="section-alt">
        <PodcastCatalog />
      </section>

      <!-- Programación -->
      <v-divider />
      <section>
        <Schedule />
      </section>

      <!-- Predicadores — comentado, no borrar -->
      <!--
      <v-divider />
      <section class="section-alt">
        <Hosts />
      </section>
      -->

      <!-- Redes sociales -->
      <v-divider />
      <section>
        <SocialLinks />
      </section>

      <!-- Contacto -->
      <v-divider />
      <section class="section-alt">
        <ContactSection />
      </section>

      <v-divider />
      <FooterSection />

    </v-main>

    <!-- Botón flotante WhatsApp -->
    <WhatsAppButton />
  </v-app>
</template>

<script setup>
import Header from './components/Header.vue'
import LivePlayer from './components/LivePlayer.vue'
import OnDemand from './components/OnDemand.vue'
import PodcastCatalog from './components/podcast.vue'
import Schedule from './components/Schedule.vue'
// import Hosts from './components/Hosts.vue'
import SocialLinks from './components/SocialLinks.vue'
import ContactSection from './components/ContactSection.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<style>
.section-alt {
  background: rgba(var(--v-theme-primary), 0.03);
}
</style>
