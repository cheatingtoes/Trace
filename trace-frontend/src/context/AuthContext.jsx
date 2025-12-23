import React, { createContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    console.log('user', user)

    useEffect(() => {
        // This effect checks for a valid session on app load.
        const verifyUser = async () => {
            try {
                // We assume you have a /profile or /me endpoint that returns the user
                // if the session is valid. The axios interceptor handles the token.
                const response = await api.post(`${import.meta.env.VITE_API_ENDPOINT}auth/refresh`);
                console.log('response@@@@@', response)
                setUser(response.data);
            } catch (error) {
                // Any error indicates the user is not logged in.
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        verifyUser();
    }, []);

    // Called by the login hook after a successful API call
    const login = (userData, accessToken) => {
        setAccessToken(accessToken);
        setUser(userData);
    };

    // Called to log the user out
    const logout = () => {
        setAccessToken(null);
        setUser(null);
        // A full page refresh to /login ensures all old state is cleared.
        window.location.href = '/login';
    };

    const value = { user, isLoading, isAuthenticated: !!user, login, logout };

    // Render nothing until the initial auth check is complete
    return (
        <AuthContext value={value}>
            {!isLoading && children}
        </AuthContext>
    );
};