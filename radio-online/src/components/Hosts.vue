<template>
    <v-container class="py-6">
        <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold mb-1">🙏 Nuestros Predicadores</h2>
            <p class="text-caption text-medium-emphasis">Siervos de la Palabra</p>
        </div>

        <v-row justify="center">
            <v-col v-for="host in hosts" :key="host.name" cols="12" sm="8" md="5">
                <v-card rounded="xl" elevation="3" class="text-center overflow-hidden">
                    <v-img :src="host.photo" height="320px" cover>
                        <template #placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular indeterminate color="primary" />
                            </div>
                        </template>
                    </v-img>
                    <v-card-title class="text-body-1 font-weight-bold pt-4">{{ host.name }}</v-card-title>
                    <v-card-subtitle class="pb-4">
                        <v-chip color="primary" variant="tonal" size="small" prepend-icon="mdi-book-cross">
                            {{ host.show }}
                        </v-chip>
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import erickPhoto from '@/assets/erick.png'
const hosts = [
    { name: 'Hno. Fernando Erick Miranda', show: 'Estudio Bíblico', photo: erickPhoto },
]
</script>

<style scoped></style>
