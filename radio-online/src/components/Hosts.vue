<template>
    <v-container align-content="center" class="d-flex justify-center mt-4" width="250">
        <v-row>
            <v-col v-for="host in hosts" :key="host.name" cols="12">
                <h3 class="text-center">Nuestros Predicadores</h3>
                <v-card class="text-center">
                    <v-img :src="host.photo" height="200px"></v-img>
                    <v-card-title>{{ host.name }}</v-card-title>
                    <v-card-subtitle>{{ host.show }}</v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import erickPhoto from '@/assets/erick.png';
const hosts = [
    { name: 'Hno. Fernando Erick Miranda', show: 'Estudio Bíblico', photo: erickPhoto },

];
</script>

<style scoped>
.col {
    border-color: aqua;
    color: lightgreen;
}
</style>
