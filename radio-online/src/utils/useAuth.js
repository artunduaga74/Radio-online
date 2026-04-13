// src/utils/useAuth.js
import { ref, computed } from 'vue'
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/firebase'

const ADMIN_EMAIL = 'artunduaga123@yahoo.com'

const user      = ref(null)
const authReady = ref(false)

onAuthStateChanged(auth, (u) => {
    user.value      = u
    authReady.value = true
})

export function useAuth() {
    const isAdmin = computed(() => user.value?.email === ADMIN_EMAIL)

    const loginWithEmail = (email, password) =>
        signInWithEmailAndPassword(auth, email, password)

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ login_hint: ADMIN_EMAIL })
        await signInWithPopup(auth, provider)
    }

    const logout = () => signOut(auth)

    return { user, isAdmin, authReady, loginWithEmail, loginWithGoogle, logout }
}
