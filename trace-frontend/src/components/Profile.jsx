import { useEffect, useState } from 'react';
import api from '../api/axios'; // Import our special instance

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // This request will automatically have the token attached.
        // If the token is expired, it will auto-refresh and retry!
        api.get('/users/me')
            .then(res => setUser(res.data))
            .catch(err => console.error("Failed to fetch profile", err));
    }, []);

    if (!user) return <div>Loading...</div>;

    return <h1>Welcome, {user.name}</h1>;
};

export default Profile;