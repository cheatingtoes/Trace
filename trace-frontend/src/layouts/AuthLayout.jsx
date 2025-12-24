import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

const AuthLayout = () => {
    return (
        <div className={styles.authLayoutContainer}>
            <div className={styles.authOverlay}></div>
            <div className={styles.authContentWrapper}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
