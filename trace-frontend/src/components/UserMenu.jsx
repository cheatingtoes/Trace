import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from '../features/auth/components/LogoutButton';
import styles from './UserMenu.module.css';

const UserMenu = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) {
        return null;
    }

    return (
        <div className={styles.userMenu} ref={menuRef}>
            <button onClick={toggleMenu} className={styles.userIcon}>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.userInfo}>
                        <p><strong>{user.displayName}</strong></p>
                        <p>{user.email}</p>
                    </div>
                    <ul className={styles.menuItems}>
                        {/* Future items can be added here */}
                    </ul>
                    <LogoutButton />
                </div>
            )}
        </div>
    );
};

export default UserMenu;
