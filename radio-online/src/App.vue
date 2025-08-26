<template>

  <v-app>

    <Header />

    <LivePlayer />

    <Schedule />
    <Hosts />

    <SocialLinks />

    <AppDownload />
    <WhatsAppButton />
    <FooterSection />

  </v-app>

</template>

<script setup>
import Header from './components/Header.vue';
import LivePlayer from './components/LivePlayer.vue';
// import NowPlaying from './components/NowPlaying.vue';
import Schedule from './components/Schedule.vue';
import Hosts from './components/Hosts.vue';
//import OnDemand from './components/OnDemand.vue';
import SocialLinks from './components/SocialLinks.vue';
//import ContactSection from './components/ContactSection.vue';
import AppDownload from './components/AppDownload.vue';
import WhatsAppButton from './components/WhatsAppButton.vue';
import FooterSection from './components/FooterSection.vue';
</script>
