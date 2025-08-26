<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h2 class="text-h5 font-weight-bold mb-4">🎧 Programación Personalizada</h2>
            </v-col>

            <v-col cols="12">
                <v-card elevation="3" class="pa-4">
                    <div v-if="isLoaded" class="ondemand-wrapper">
                        <div class="cc_ondemand_content" :data-username="username">Cargando…</div>
                    </div>
                    <div v-else class="text-center">
                        <v-progress-circular indeterminate color="primary" size="40" />
                        <p class="mt-2">Cargando contenido especial…</p>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const username = 'nonefern';
const isLoaded = ref(false);

onMounted(() => {
    const checkScript = () => {
        if (window.OnDemand) {
            isLoaded.value = true;
            window.OnDemand.load();
        } else {
            setTimeout(checkScript, 300); // Intenta nuevamente hasta que cargue
        }
    };

    checkScript();
});
</script>

<style scoped>
.ondemand-wrapper {
    min-height: 300px;
}
</style>
