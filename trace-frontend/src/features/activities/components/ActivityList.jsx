import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ActivityList.module.css';

const ActivityList = ({ activities, loading, error }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredActivities = activities.filter((activity) =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p>Loading activities...</p>;
    if (error) return <p>Error loading activities.</p>;

    return (
        <div className={styles.container}>
            <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchBar}
            />
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
