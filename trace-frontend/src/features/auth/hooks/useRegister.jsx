import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../api/axios';

export const useRegister = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formState, setFormState] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formState.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setError('');

        if (!formState.name || !formState.email || !formState.password) {
            setError('All fields are required.');
            return;
        }
        
        setIsSubmitting(true);

        try {
            const response = await api.post(`/auth/register`, formState);
            const { user, accessToken } = response.data;
            login(user, accessToken);
            navigate('/');
        } catch (err) {
            console.log('errr@@@@', err)
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formState,
        error,
        isSubmitting,
        handleChange,
        handleRegister,
    };
};
