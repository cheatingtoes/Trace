import { useState } from 'react';
import useActivities from '../hooks/useActivities';
import styles from './CreateActivity.module.css';

const CreateActivity = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { createActivity } = useActivities();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            alert('Name is required');
            return;
        }
        const newActivity = {
            name,
            description,
            startDate: startDate,
            endDate: endDate,
        };
        const created = await createActivity(newActivity);
        if (created) {
            setName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            setIsExpanded(false);
        }
    };

    return (
        <div className={styles.container}>
            <button onClick={() => setIsExpanded(!isExpanded)} className={styles.expandButton}>
                {isExpanded ? '-' : '+'}
            </button>
            {isExpanded && (
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
            )}
        </div>
    );
};

export default CreateActivity;
