import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBdeMWb5LkZHzwjh-H-Dzuz0_4zqTG7IFU",
    authDomain: "smart-study-llm-b3ba6.firebaseapp.com",
    projectId: "smart-study-llm-b3ba6",
    storageBucket: "smart-study-llm-b3ba6.firebasestorage.app",
    messagingSenderId: "218487360919",
    appId: "1:218487360919:web:84c28cd3f999617407c8d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
