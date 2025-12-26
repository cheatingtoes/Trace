import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../api/axios';

export const useLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formState, setFormState] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleLocalLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const response = await api.post(`/auth/login`, formState);
            const { user, accessToken } = response.data;
            login(user, accessToken); // Update global context
            navigate('/'); // Navigate to home
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        const baseURL = import.meta.env.VITE_API_ENDPOINT || '';
        window.location.href = `${baseURL}/auth/google`;
    };

    return {
        formState,
        error,
        isSubmitting,
        handleChange,
        handleLocalLogin,
        handleGoogleLogin,
    };
};