import { useParams, useNavigate } from 'react-router-dom';
import styles from './ActivityDetail.module.css';
import ActivityForm from './ActivityForm';
import SidebarHeader from '../../../components/SidebarHeader';

import useActivity from '../hooks/useActivity';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activity, loading, error, fetchActivity, updateActivity } = useActivity(id);

    const isEditing = true;

    return (
        <div className={styles.detailContainer}>
            <SidebarHeader
                left={
                    <>
                        <button onClick={() => navigate(-1)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', marginRight: '0.5rem' }}>
                            ←
                        </button>
                    </>
                }
                right={<span style={{ cursor: 'pointer' }}>⚙️</span>}
            />
            {isEditing ? (
                <>
                    <div className={styles.header}>
                        <h2>EDIT ACTIVITY</h2>
                    </div>
                    <ActivityForm initialValues={activity} onSubmit={updateActivity} isOpen={true} />
                </>
            ) : (
                <>
                    <div className={styles.header}>
                        <h2>ACTIVITY DETAILS</h2>
                    </div>
                    <div className={styles.content}>
                        <p>Details for Activity ID: {id}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActivityDetail;