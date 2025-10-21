import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

class AuthService {
    constructor() {
        const app = initializeApp(firebaseConfig);
        this.auth = getAuth(app);
        this.db = getFirestore(app);
        this.user = null;
    }

    async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            throw error;
        }
    }

    async saveConfiguration(config) {
        if (!this.auth.currentUser) throw new Error('User not authenticated');

        try {
            const configRef = doc(this.db, 'configurations', this.auth.currentUser.uid);
            await setDoc(configRef, {
                ...config,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            throw error;
        }
    }

    async getConfiguration() {
        if (!this.auth.currentUser) throw new Error('User not authenticated');

        try {
            const configRef = doc(this.db, 'configurations', this.auth.currentUser.uid);
            const configSnap = await getDoc(configRef);
            
            if (configSnap.exists()) {
                return configSnap.data();
            }
            
            return null;
        } catch (error) {
            throw error;
        }
    }

    onAuthStateChange(callback) {
        return onAuthStateChanged(this.auth, (user) => {
            this.user = user;
            callback(user);
        });
    }
}

export const authService = new AuthService();