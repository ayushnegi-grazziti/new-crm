import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthContext: Initializing listener');
        const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('AuthContext: Firebase state changed', firebaseUser ? 'USER_LOGGED_IN' : 'NO_USER');

            if (firebaseUser) {
                // Firebase user is logged in — check for CRM token
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    console.log('AuthContext: CRM token found, setting user');
                    setUser(JSON.parse(storedUser));
                    setLoading(false);

                    // Verify with backend in background
                    api.get('/auth/verify').catch(err => {
                        console.warn('Background verify failed:', err.message);
                        if (err.response?.status === 401) {
                            logout();
                        }
                    });
                } else {
                    console.log('AuthContext: No CRM token, starting loading and exchanging...');
                    setLoading(true); // CRITICAL: Prevent ProtectedRoute from redirecting
                    // No CRM token — must exchange Firebase token for CRM token
                    try {
                        const idToken = await firebaseUser.getIdToken();
                        const response = await api.post('/auth/firebase-login', { idToken });
                        const { token: crmToken, user: crmUserData } = response.data;

                        console.log('AuthContext: Exchange successful');
                        localStorage.setItem('token', crmToken);
                        localStorage.setItem('user', JSON.stringify(crmUserData));
                        setUser(crmUserData);
                    } catch (err) {
                        console.error('CRM Backend exchange failed:', err.message);
                        logout();
                    } finally {
                        setLoading(false);
                    }
                }
            } else {
                console.log('AuthContext: No Firebase user, checking for standalone CRM session');
                // No Firebase user — check for persistent CRM session
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');

                if (token && userData) {
                    try {
                        setUser(JSON.parse(userData));
                        // If we have a standalone session, we can stop loading
                        setLoading(false);

                        api.get('/auth/verify').catch(err => {
                            if (err.response?.status === 401) logout();
                        });
                    } catch (e) {
                        console.error('Failed to parse local user data', e);
                        logout();
                        setLoading(false);
                    }
                } else {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribeFirebase();
    }, []);


    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        console.log('AuthContext: Logging out');
        try {
            await signOut(auth);
        } catch (e) {
            console.error('Firebase signout error', e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
