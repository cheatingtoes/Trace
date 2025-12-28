import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ActivityList.module.css';
import Input from '../../../components/ui/Input';

const ActivityList = ({ activities, loading, error }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredActivities = activities.filter((activity) =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p className={styles.loading}>Loading activities...</p>;
    if (error) return <p className={styles.error}>Error loading activities.</p>;

    return (
        <div className={styles.container}>
            <div className={styles.searchWrapper}>
                <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ul className={styles.activityList}>
                {filteredActivities.map((activity) => (
                    <li key={activity.id} className={styles.activityItem}>
                        <Link to={`/activity/${activity.id}`}>{activity.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityList;
