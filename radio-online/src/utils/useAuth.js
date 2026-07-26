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

// Correos autorizados como administradores (deben coincidir con
// firestore.rules y storage.rules)
const ADMIN_EMAILS = [
    'artunduaga123@yahoo.com',
    'artunduaga74@gmail.com',
]

const user      = ref(null)
const authReady = ref(false)

onAuthStateChanged(auth, (u) => {
    user.value      = u
    authReady.value = true
})

export function useAuth() {
    const isAdmin = computed(() => ADMIN_EMAILS.includes(user.value?.email))

    const loginWithEmail = (email, password) =>
        signInWithEmailAndPassword(auth, email, password)

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    const logout = () => signOut(auth)

    return { user, isAdmin, authReady, loginWithEmail, loginWithGoogle, logout }
}
