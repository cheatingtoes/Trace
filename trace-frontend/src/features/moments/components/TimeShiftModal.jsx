import React, { useState } from 'react';
import styles from './TimeShiftModal.module.css';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

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
                    <Input
                        label="Shift by minutes (negative to go back)"
                        type="number"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        autoFocus
                    />
                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Apply Shift
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimeShiftModal;