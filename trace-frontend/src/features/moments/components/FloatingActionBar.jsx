import React from 'react';
import { createPortal } from 'react-dom';
import styles from './FloatingActionBar.module.css';

const FloatingActionBar = ({ 
    selectedCount, 
    onDeselectAll, 
    onDelete, 
    onTimeShift, 
    centerAction 
}) => {
    if (selectedCount === 0) return null;

    const portalRoot = document.getElementById('sidebar-floating-root');
    if (!portalRoot) return null;

    return createPortal(
        <div className={styles.container}>
            <div className={styles.leftGroup}>
                <span className={styles.count}>{selectedCount} Selected</span>
                <button className={styles.deselectBtn} onClick={onDeselectAll}>
                    Deselect All
                </button>
            </div>

            <div className={styles.centerGroup}>
                {centerAction && (
                    <button className={styles.actionBtn} onClick={centerAction.onClick}>
                        {centerAction.label}
                    </button>
                )}
            </div>

            <div className={styles.rightGroup}>
                <button 
                    className={styles.iconBtn} 
                    onClick={onTimeShift}
                    title="Shift Time"
                >
                    🕒
                </button>
                <button 
                    className={`${styles.iconBtn} ${styles.deleteBtn}`} 
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${selectedCount} moments?`)) {
                            onDelete();
                        }
                    }}
                    title="Delete Selected"
                >
                    🗑️
                </button>
            </div>
        </div>,
        portalRoot
    );
};

export default FloatingActionBar;