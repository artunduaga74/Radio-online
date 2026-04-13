<template>
    <v-container class="py-6">
        <div class="text-center mb-4">
            <v-chip color="deep-orange" variant="tonal" prepend-icon="mdi-music-box-multiple" size="large">
                Audio a la Carta
            </v-chip>
        </div>

        <v-row justify="center">
            <v-col cols="12" sm="10" md="8">
                <v-card rounded="xl" elevation="2" class="pa-3">
                    <div ref="widgetRef" class="cc_ondemand_content" data-username="nonefern">Cargando ...</div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'

const CENTOVA_SCRIPT_ID = 'centova-ondemand-js'
const JQUERY_SCRIPT_ID  = 'centova-jquery-js'

const loadScript = (id, src) => new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return }
    const s = document.createElement('script')
    s.id = id
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
})

onMounted(async () => {
    await nextTick()

    // 1. Centova necesita jQuery — cargarlo primero si no está presente
    if (!window.jQuery) {
        await loadScript(JQUERY_SCRIPT_ID, 'https://code.jquery.com/jquery-3.7.1.min.js')
    }

    // 2. Recargar el script de Centova para que re-detecte el div
    const old = document.getElementById(CENTOVA_SCRIPT_ID)
    if (old) old.remove()

    await loadScript(CENTOVA_SCRIPT_ID, 'https://cast1.asurahosting.com/system/ondemand.js')
})
</script>
