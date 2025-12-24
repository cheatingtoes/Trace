import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useActivities from '../hooks/useActivities';
import CreateActivity from './ActivityForm';
import SidebarHeader from '../../../components/SidebarHeader';
import styles from './ActivityDetail.module.css'; // Reusing detail styles for consistency

const ActivityEditView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activities } = useActivities();
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        if (activities.length > 0) {
            const found = activities.find(a => a.id === id);
            if (found) {
                setActivity(found);
            }
        }
    }, [id, activities]);

    const handleUpdate = async (updatedData) => {
        // Placeholder for update logic. 
        // You would typically call an updateActivity function from useActivities here.
        console.log('Updating activity:', id, updatedData);
        navigate(-1);
        return true;
    };

    return (
        <div className={styles.detailContainer}>
            <SidebarHeader
                left={
                    <>
                        <button onClick={() => navigate(-1)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', marginRight: '0.5rem' }}>
                            ←
                        </button>
                        <h2>EDIT ACTIVITY</h2>
                    </>
                }
            />
            {activity && (
                <CreateActivity initialValues={activity} onSubmit={handleUpdate} isOpen={true} onClose={() => navigate(-1)} buttonText="Save Changes" />
            )}
        </div>
    );
};

export default ActivityEditView;