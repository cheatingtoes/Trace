import { useState, useEffect } from 'react';
import styles from './ActivityForm.module.css';

const ActivityForm = ({ onSubmit, onSuccess, isOpen, onClose, initialValues = {}, buttonText = 'Create Activity' }) => {
    const {
        name: rawName,
        description: rawDescription,
        startDate: rawStartDate,
        endDate: rawEndDate
    } = initialValues || {};

    const initialName = rawName ?? '';
    const initialDescription = rawDescription ?? '';
    const initialStartDate = rawStartDate ?? '';
    const initialEndDate = rawEndDate ?? '';

    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);


    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setDescription(initialDescription);
            setStartDate(initialStartDate);
            setEndDate(initialEndDate);
        }
    }, [isOpen, initialName, initialDescription, initialStartDate, initialEndDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            alert('Name is required');
            return;
        }
        const newActivity = {
            name,
            description,
            startDate,
            endDate,
        };
        const success = await onSubmit(newActivity);
        if (success) {
            setName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            onClose();
            if (onSuccess) onSuccess();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    placeholder="Activity Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={styles.input}
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={styles.textarea}
                />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.input}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.input}
                />
                <button type="submit" className={styles.submitButton}>{buttonText}</button>
            </form>
        </div>
    );
};

export default ActivityForm;
