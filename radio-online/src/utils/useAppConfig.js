// src/utils/useAppConfig.js
import { ref, readonly } from 'vue'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

const CONFIG_DOC = doc(db, 'config', 'app')

// Valores por defecto (mientras Firestore no tenga el documento)
const defaults = {
    radioName: 'La Voz de Filadelfia',
    slogan: 'Tu radio cristiana',
    whatsapp: '+50764175859',
    facebook: 'https://www.facebook.com/profile.php?id=61579605448786',
    youtube: 'https://www.youtube.com/@fernandomiranda1709',
    spotify: 'https://open.spotify.com/show/4VZFQ816UPQzJfhEPAIqEH',
}

const config = ref({ ...defaults })
const configReady = ref(false)

// Escuchar cambios en tiempo real
onSnapshot(CONFIG_DOC, (snap) => {
    if (snap.exists()) {
        config.value = { ...defaults, ...snap.data() }
    }
    configReady.value = true
})

export function useAppConfig() {
    const saveConfig = async (data) => {
        await setDoc(CONFIG_DOC, data, { merge: true })
    }

    return {
        config: readonly(config),
        configReady,
        saveConfig,
    }
}
