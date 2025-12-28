import React from 'react';
import styles from './ActivityDetail.module.css';

const ActivityReadView = ({ activity }) => {
    return (
        <div className={styles.editViewContainer}>
            <div className={styles.titleInput} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {activity?.name || 'Untitled Activity'}
            </div>
            {activity?.description && (
                <div className={styles.descriptionInput} style={{ whiteSpace: 'pre-wrap' }}>
                    {activity.description}
                </div>
            )}
            <div className={styles.dateGroup}>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.2rem' }}>Start Date</label>
                    <div>{activity?.startDate ? new Date(activity.startDate).toLocaleDateString() : '—'}</div>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.2rem' }}>End Date</label>
                    <div>{activity?.endDate ? new Date(activity.endDate).toLocaleDateString() : '—'}</div>
                </div>
            </div>
        </div>
    );
};

export default ActivityReadView;