import { useState } from 'react';
import styles from './CreateActivity.module.css';

const CreateActivity = ({ createActivity, onActivityCreated, isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
        const created = await createActivity(newActivity);
        if (created) {
            setName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            onClose();
            onActivityCreated(); // Notify parent that a new activity was created
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
                <button type="submit" className={styles.submitButton}>Create Activity</button>
            </form>
        </div>
    );
};

export default CreateActivity;
