import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UserMenu from '../components/UserMenu';
import styles from './MainLayout.module.css';

const MainLayout = () => {
    return (
        <div className={styles.mainLayoutContainer}>
            {/* Sidebar containing the nested route content (Activities, Photos, etc.) */}
                <Sidebar defaultWidth={30} side="left">
                    <Outlet />
                </Sidebar>

            {/* Top Right User Menu */}
            <div className={styles.userMenu}>
                <UserMenu />
            </div>
        </div>
    );
};

export default MainLayout;
