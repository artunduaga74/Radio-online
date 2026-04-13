<template>
    <a
        v-if="config.whatsapp"
        :href="`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`"
        target="_blank"
        class="wa-fab"
        aria-label="Escribir por WhatsApp">
        <v-icon size="24" color="white">mdi-whatsapp</v-icon>
    </a>
</template>

<script setup>
import { useAppConfig } from '@/utils/useAppConfig'
const { config } = useAppConfig()
</script>

<style scoped>
.wa-fab {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    right: 14px;
    z-index: 900;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #25d366;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    opacity: 0.45;
    transition: opacity 0.2s, transform 0.15s;
    text-decoration: none;
}
/* Se vuelve visible al tocar o pasar el cursor */
.wa-fab:hover,
.wa-fab:active,
.wa-fab:focus {
    opacity: 1;
    transform: scale(1.12);
}
</style>
