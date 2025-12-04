// Firebase configuration for CoinVault
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDsx7edlelOeee1Fbo0T06gmK9lLEDqCfE",
    authDomain: "coinvault-92b48.firebaseapp.com",
    projectId: "coinvault-92b48",
    storageBucket: "coinvault-92b48.firebasestorage.app",
    messagingSenderId: "474851130312",
    appId: "1:474851130312:web:37d1661a7be8e9ff801efd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth functions
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        let message = 'Error al iniciar sesión';
        if (error.code === 'auth/user-not-found') {
            message = 'Usuario no encontrado';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Contraseña incorrecta';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email inválido';
        } else if (error.code === 'auth/invalid-credential') {
            message = 'Credenciales inválidas';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Demasiados intentos. Intenta más tarde.';
        }
        return { success: false, error: message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al cerrar sesión' };
    }
};

export { auth, onAuthStateChanged };
