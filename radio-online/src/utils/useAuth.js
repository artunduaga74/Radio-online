// src/utils/useAuth.js
// Composable singleton para autenticación con Google
import { ref, computed } from 'vue'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'

const ADMIN_EMAIL = 'artunduaga74@gmail.com'

// Estado global compartido entre todos los componentes
const user = ref(null)
const authReady = ref(false)

// Inicializar listener una sola vez al importar el módulo
onAuthStateChanged(auth, (u) => {
    user.value = u
    authReady.value = true
})

export function useAuth() {
    const isAdmin = computed(() =>
        user.value?.email === ADMIN_EMAIL
    )

    const login = async () => {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ login_hint: ADMIN_EMAIL })
        await signInWithPopup(auth, provider)
    }

    const logout = () => signOut(auth)

    return { user, isAdmin, authReady, login, logout }
}
