import React from 'react';
import Sidebar from '../components/Sidebar'; // Import the Sidebar
import UserMenu from '../components/UserMenu';
import styles from './MainDisplay.module.css'; 

const MainDisplay = () => {
    return (
        <div className={styles.container}>
            <Sidebar defaultWidth={25} side="left">
                <h2>Edit Content</h2>
                <p>This is the sidebar where you can edit map content.</p>
            </Sidebar>
            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>TRACE</h1>
                    <UserMenu />
                </div>
            </div>
        </div>
    );
}

export default MainDisplay;