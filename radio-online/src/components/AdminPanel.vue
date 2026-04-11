<template>
    <!-- Botón flotante admin (solo visible cuando logueado) -->
    <v-btn
        v-if="isAdmin"
        icon
        color="primary"
        variant="tonal"
        size="small"
        style="position:fixed; bottom:160px; right:20px; z-index:1000;"
        @click="drawer = true">
        <v-icon>mdi-shield-account</v-icon>
        <v-tooltip activator="parent" location="left">Panel Admin</v-tooltip>
    </v-btn>

    <!-- Panel lateral admin -->
    <v-navigation-drawer
        v-model="drawer"
        location="right"
        width="380"
        temporary>

        <!-- Cabecera del panel -->
        <v-list-item
            prepend-icon="mdi-shield-account"
            title="Panel de Administración"
            subtitle="La Voz de Filadelfia"
            class="py-4">
            <template #append>
                <v-btn icon variant="text" @click="drawer = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-list-item>

        <v-divider />

        <v-container class="pa-4">

            <!-- Sesión activa -->
            <v-chip
                color="success"
                variant="tonal"
                prepend-icon="mdi-account-check"
                class="mb-4"
                size="small">
                {{ user?.email }}
            </v-chip>

            <!-- Formulario agregar / editar episodio -->
            <h3 class="text-body-1 font-weight-bold mb-3">
                <v-icon size="18" class="mr-1">{{ editingId ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
                {{ editingId ? 'Editar episodio' : 'Agregar episodio' }}
            </h3>

            <v-form ref="formRef" @submit.prevent="saveEpisode">
                <v-text-field
                    v-model="form.spotifyUrl"
                    label="URL del episodio en Spotify"
                    placeholder="https://open.spotify.com/episode/..."
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-spotify"
                    :rules="[v => !!v || 'Requerido', v => toEmbedUrl(v) !== null || 'URL de episodio de Spotify inválida']"
                    class="mb-2"
                    hint="Copia el enlace desde Spotify: ··· → Compartir → Copiar enlace"
                    persistent-hint />

                <v-text-field
                    v-model="form.title"
                    label="Título del episodio"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-format-title"
                    :rules="[v => !!v || 'Requerido']"
                    class="mb-2 mt-3" />

                <v-textarea
                    v-model="form.description"
                    label="Descripción (opcional)"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-text"
                    rows="2"
                    class="mb-3" />

                <div class="d-flex ga-2">
                    <v-btn
                        v-if="editingId"
                        variant="tonal"
                        rounded="lg"
                        prepend-icon="mdi-close"
                        @click="cancelEdit">
                        Cancelar
                    </v-btn>
                    <v-btn
                        type="submit"
                        color="primary"
                        :block="!editingId"
                        rounded="lg"
                        :prepend-icon="editingId ? 'mdi-check' : 'mdi-content-save'"
                        :loading="saving">
                        {{ editingId ? 'Actualizar' : 'Guardar episodio' }}
                    </v-btn>
                </div>
            </v-form>

            <v-divider class="my-4" />

            <!-- Lista de episodios existentes -->
            <h3 class="text-body-1 font-weight-bold mb-3">
                <v-icon size="18" class="mr-1">mdi-format-list-bulleted</v-icon>
                Episodios publicados ({{ episodes.length }})
            </h3>

            <div v-if="loadingEpisodes" class="text-center py-4">
                <v-progress-circular indeterminate color="primary" size="32" />
            </div>

            <v-list v-else density="compact" class="pa-0">
                <v-list-item
                    v-for="ep in episodes"
                    :key="ep.id"
                    :title="ep.title"
                    :subtitle="ep.date"
                    rounded="lg"
                    :active="editingId === ep.id"
                    color="primary"
                    class="mb-1 px-2">
                    <template #append>
                        <v-btn
                            icon
                            size="x-small"
                            color="primary"
                            variant="text"
                            @click="startEdit(ep)">
                            <v-icon size="16">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            size="x-small"
                            color="error"
                            variant="text"
                            :loading="deletingId === ep.id"
                            @click="deleteEpisode(ep.id)">
                            <v-icon size="16">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-list-item>

                <v-list-item v-if="episodes.length === 0">
                    <v-list-item-title class="text-caption text-medium-emphasis">
                        No hay episodios aún.
                    </v-list-item-title>
                </v-list-item>
            </v-list>

            <v-divider class="my-4" />

            <!-- Cerrar sesión -->
            <v-btn
                color="error"
                variant="tonal"
                block
                rounded="lg"
                prepend-icon="mdi-logout"
                @click="handleLogout">
                Cerrar sesión
            </v-btn>
        </v-container>
    </v-navigation-drawer>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="bottom">
        {{ snackbarMsg }}
    </v-snackbar>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import {
    collection, addDoc, deleteDoc, doc, updateDoc,
    onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/utils/useAuth'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['update:open'])

const { user, isAdmin, logout } = useAuth()

const drawer = ref(false)

watch(() => props.open, v => { if (v) drawer.value = true })
watch(drawer, v => { if (!v) emit('update:open', false) })

const saving = ref(false)
const deletingId = ref(null)
const editingId = ref(null)
const loadingEpisodes = ref(true)
const episodes = ref([])
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')
const formRef = ref(null)

const form = reactive({ spotifyUrl: '', title: '', description: '' })

// Convertir URL de Spotify a embed URL
const toEmbedUrl = (url) => {
    if (!url) return null
    const clean = url.split('?')[0]
    const match = clean.match(/open\.spotify\.com\/episode\/([A-Za-z0-9]+)/)
    return match ? `https://open.spotify.com/embed/episode/${match[1]}` : null
}

// Reconstruir URL de Spotify desde embed URL (para pre-llenar al editar)
const fromEmbedUrl = (embedUrl) => {
    const match = embedUrl?.match(/open\.spotify\.com\/embed\/episode\/([A-Za-z0-9]+)/)
    return match ? `https://open.spotify.com/episode/${match[1]}` : ''
}

const notify = (msg, color = 'success') => {
    snackbarMsg.value = msg
    snackbarColor.value = color
    snackbar.value = true
}

// Iniciar edición: pre-llenar formulario
const startEdit = (ep) => {
    editingId.value = ep.id
    form.spotifyUrl = fromEmbedUrl(ep.embedUrl)
    form.title = ep.title
    form.description = ep.description || ''
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
    editingId.value = null
    formRef.value?.reset()
}

// Escuchar episodios en tiempo real
let unsubscribe = null
onMounted(() => {
    const q = query(collection(db, 'episodes'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(q, (snap) => {
        episodes.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loadingEpisodes.value = false
    })
})
onUnmounted(() => unsubscribe?.())

// Guardar o actualizar episodio
const saveEpisode = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    const embedUrl = toEmbedUrl(form.spotifyUrl)
    if (!embedUrl) return

    saving.value = true
    try {
        if (editingId.value) {
            // Actualizar episodio existente
            await updateDoc(doc(db, 'episodes', editingId.value), {
                title: form.title.trim(),
                description: form.description.trim(),
                embedUrl
            })
            notify('Episodio actualizado ✓')
            editingId.value = null
        } else {
            // Agregar nuevo episodio
            await addDoc(collection(db, 'episodes'), {
                title: form.title.trim(),
                description: form.description.trim(),
                embedUrl,
                date: new Date().toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }),
                createdAt: serverTimestamp()
            })
            notify('Episodio publicado ✓')
        }
        formRef.value.reset()
    } catch (e) {
        notify('Error: ' + e.message, 'error')
    } finally {
        saving.value = false
    }
}

// Eliminar episodio
const deleteEpisode = async (id) => {
    if (editingId.value === id) cancelEdit()
    deletingId.value = id
    try {
        await deleteDoc(doc(db, 'episodes', id))
        notify('Episodio eliminado')
    } catch (e) {
        notify('Error al eliminar', 'error')
    } finally {
        deletingId.value = null
    }
}

const handleLogout = async () => {
    await logout()
    drawer.value = false
    cancelEdit()
    notify('Sesión cerrada')
}
</script>
