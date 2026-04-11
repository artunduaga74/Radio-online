<template>
    <v-container class="py-6">
        <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold mb-1">✉️ Contáctanos</h2>
            <p class="text-caption text-medium-emphasis">Escríbenos un mensaje</p>
        </div>

        <v-row justify="center">
            <v-col cols="12" sm="10" md="7">
                <v-card rounded="xl" elevation="2" class="pa-4">
                    <v-form ref="formRef" @submit.prevent="sendMessage">
                        <v-text-field v-model="form.name" label="Tu nombre" prepend-inner-icon="mdi-account"
                            variant="outlined" rounded="lg" :rules="[v => !!v || 'Requerido']" class="mb-2" />

                        <v-text-field v-model="form.email" label="Correo electrónico" prepend-inner-icon="mdi-email"
                            variant="outlined" rounded="lg" type="email"
                            :rules="[v => !!v || 'Requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
                            class="mb-2" />

                        <v-textarea v-model="form.message" label="Mensaje" prepend-inner-icon="mdi-message-text"
                            variant="outlined" rounded="lg" rows="4" :rules="[v => !!v || 'Requerido']" class="mb-4" />

                        <v-btn type="submit" color="primary" block size="large" rounded="lg" prepend-icon="mdi-send"
                            :loading="sending">
                            Enviar mensaje
                        </v-btn>
                    </v-form>

                    <!-- Alternativa WhatsApp 
                    <v-divider class="my-4" />
                    <v-btn
                        color="green"
                        variant="tonal"
                        block
                        rounded="lg"
                        prepend-icon="mdi-whatsapp"
                        href="https://wa.me/+50764175859"
                        target="_blank">
                        Escribir por WhatsApp
                    </v-btn>
                     -->
                </v-card>
            </v-col>
        </v-row>

        <!-- Snackbar de confirmación -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="4000" location="bottom">
            {{ snackbarMsg }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formRef = ref(null)
const sending = ref(false)
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')

const form = reactive({ name: '', email: '', message: '' })

const sendMessage = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    sending.value = true
    try {
        // Abre el cliente de correo con los datos del formulario
        const subject = encodeURIComponent(`Mensaje de ${form.name} — La Voz de Filadelfia`)
        const body = encodeURIComponent(`Nombre: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
        window.location.href = `mailto:artunduaga123@yahoo.com?subject=${subject}&body=${body}`

        snackbarMsg.value = '¡Mensaje listo! Se abrirá tu cliente de correo.'
        snackbarColor.value = 'success'
        snackbar.value = true
        formRef.value.reset()
    } finally {
        sending.value = false
    }
}
</script>

<style scoped></style>
