import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return { handleLogout };
};
