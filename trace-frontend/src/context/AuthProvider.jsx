import React, { useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This effect checks for a valid session on app load.
        const verifyUser = async () => {
            try {
                // We assume you have a /profile or /me endpoint that returns the user
                // if the session is valid. The axios interceptor handles the token.
                const response = await api.post(`/auth/refresh`);
                const { user, accessToken } = response.data;
                setAccessToken(accessToken);
                setUser(user);
            } catch (error) {
                console.error('Error verifying user:', error);
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
    const logout = async () => {
        try {
            await api.post(`/auth/logout`);
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    const value = { user, isLoading, isAuthenticated: !!user, login, logout };

    // Render nothing until the initial auth check is complete
    return (
        <AuthContext value={value}>
            {!isLoading && children}
        </AuthContext>
    );
};