import React, { useState } from 'react';
import styles from './TimeShiftModal.module.css';

const TimeShiftModal = ({ isOpen, onClose, onConfirm }) => {
    const [minutes, setMinutes] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(Number(minutes));
        onClose();
        setMinutes(0);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h3 className={styles.header}>Shift Time</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Shift by minutes (negative to go back):</label>
                        <input 
                            type="number" 
                            className={styles.input}
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className={`${styles.btn} ${styles.cancelBtn}`} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.confirmBtn}`}>
                            Apply Shift
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimeShiftModal;