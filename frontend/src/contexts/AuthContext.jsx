import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Signup with email and password
    const signup = async (email, password, fullName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get Firebase ID token
            const idToken = await user.getIdToken();

            // Create user profile in backend
            await api.post('/api/auth/firebase-signup', {
                uid: user.uid,
                email: user.email,
                full_name: fullName
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            return user;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    // Login with email and password
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Google Sign-In
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Get Firebase ID token
            const idToken = await user.getIdToken();

            // Create/update user profile in backend
            await api.post('/api/auth/firebase-signup', {
                uid: user.uid,
                email: user.email,
                full_name: user.displayName || 'User'
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            return user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Reset password
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        setLoading(true); // Ensure loading is true at start
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user ? user.email : 'No user');
            setCurrentUser(user);

            // Store token in localStorage for API calls
            if (user) {
                try {
                    const token = await user.getIdToken();
                    localStorage.setItem('firebase_token', token);
                } catch (error) {
                    console.error('Error getting token:', error);
                }
            } else {
                localStorage.removeItem('firebase_token');
            }

            setLoading(false); // Set loading to false after processing
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        signInWithGoogle,
        logout,
        resetPassword,
        loading,
        isAuthenticated: !!currentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
