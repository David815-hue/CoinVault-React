// Firebase configuration for CoinVault
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin email (hardcoded)
const ADMIN_EMAIL = 'davidochoa81550@gmail.com';

// Check if user is admin
export const isAdminUser = (email) => {
    return email === ADMIN_EMAIL;
};

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

// Password reset
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        let message = 'Error al enviar el correo';
        if (error.code === 'auth/user-not-found') {
            message = 'No existe una cuenta con este correo';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Correo inválido';
        }
        return { success: false, error: message };
    }
};

// Firestore: Sync user stats (once per day)
export const syncUserStats = async (uid, email, stats) => {
    try {
        const today = new Date().toDateString();
        const lastSync = localStorage.getItem('lastStatsSync');

        // Only sync if it's a new day
        if (lastSync === today) {
            return { success: true, skipped: true };
        }

        await setDoc(doc(db, 'users', uid), {
            email,
            monedas: stats.monedas || 0,
            billetes: stats.billetes || 0,
            albums: stats.albums || 0,
            lastSync: new Date().toISOString()
        });

        localStorage.setItem('lastStatsSync', today);
        return { success: true };
    } catch (error) {
        console.error('Error syncing stats:', error);
        return { success: false, error: error.message };
    }
};

// Firestore: Force sync stats (on logout or manual trigger)
export const forceSyncUserStats = async (uid, email, stats) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            email,
            monedas: stats.monedas || 0,
            billetes: stats.billetes || 0,
            albums: stats.albums || 0,
            lastSync: new Date().toISOString()
        });

        localStorage.setItem('lastStatsSync', new Date().toDateString());
        return { success: true };
    } catch (error) {
        console.error('Error syncing stats:', error);
        return { success: false, error: error.message };
    }
};

// Firestore: Get all users stats (admin only)
export const getAllUsersStats = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, users };
    } catch (error) {
        console.error('Error getting users:', error);
        return { success: false, error: error.message };
    }
};

export { auth, db, onAuthStateChanged };

