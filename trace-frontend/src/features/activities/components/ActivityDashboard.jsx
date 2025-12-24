import { useState } from 'react';
import ActivityForm from './ActivityForm'; // Assuming CreateActivity is in the same directory
import ActivityList from './ActivityList';     // Assuming ActivityList is in the same directory
import styles from './ActivityDashboard.module.css';
import ActivityFormStyles from './ActivityForm.module.css';
import useActivities from '../hooks/useActivities';
import SidebarHeader from '../../../components/SidebarHeader';

const ActivityDashboard = () => {
    const { activities, loading, error, createActivity, fetchActivities } = useActivities();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleActivityCreated = () => {
        setIsExpanded(false);
    };

    return (
        <div className={styles.dashboardContainer}>
            <SidebarHeader
                left={<h2>YOUR JOURNEYS</h2>}
                right={
                    <div className={styles.createActivityButton}>
                        <button onClick={() => setIsExpanded(!isExpanded)} className={ActivityFormStyles.expandButton}>
                            {isExpanded ? '-' : '+'}
                        </button>
                    </div>
                }
            />
            <ActivityForm onSubmit={createActivity} onSuccess={handleActivityCreated} isOpen={isExpanded} onClose={() => setIsExpanded(false)} />
            <div className={styles.yourJourneys}>
                <ActivityList activities={activities} loading={loading} error={error} />
            </div>
        </div>
    );
};

export default ActivityDashboard;
