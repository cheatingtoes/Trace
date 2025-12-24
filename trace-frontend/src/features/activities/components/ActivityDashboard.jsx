import { useState } from 'react';
import CreateActivity from './CreateActivity'; // Assuming CreateActivity is in the same directory
import ActivityList from './ActivityList';     // Assuming ActivityList is in the same directory
import styles from './ActivityDashboard.module.css';
import createActivityStyles from './CreateActivity.module.css';
import useActivities from '../hooks/useActivities';

const ActivityDashboard = () => {
    const { activities, loading, error, createActivity, fetchActivities } = useActivities();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <h2>YOUR JOURNEYS</h2>
                <div className={styles.createActivityButton}>
                    <button onClick={() => setIsExpanded(!isExpanded)} className={createActivityStyles.expandButton}>
                        {isExpanded ? '-' : '+'}
                    </button>
                </div>
            </div>
            <CreateActivity createActivity={createActivity} isOpen={isExpanded} onClose={() => setIsExpanded(false)} />
            <div className={styles.yourJourneys}>
                <ActivityList activities={activities} loading={loading} error={error} />
            </div>
        </div>
    );
};

export default ActivityDashboard;
