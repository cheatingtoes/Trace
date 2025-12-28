import React from 'react';
import styles from './MomentsRow.module.css';

const MomentsRow = ({ 
    title, 
    subheader, 
    moments = [], 
    onNameChange, 
    onDelete,
    onMomentHover
}) => {
    return (
        <div className={styles.rowContainer}>
            <div className={styles.rowHeader}>
                <h4 className={styles.rowTitle}>{title}</h4>
                <span className={styles.rowSubheader}>{subheader}</span>
            </div>
            
            <div className={styles.momentsGrid}>
                {moments.map((moment) => (
                    <div 
                        key={moment.id} 
                        className={styles.momentItem}
                        onMouseEnter={() => onMomentHover && onMomentHover(moment.id)}
                        onMouseLeave={() => onMomentHover && onMomentHover(null)}
                    >
                        <div className={styles.thumbnailContainer}>
                            <img 
                                src={`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${moment.storageThumbKey}`} 
                                alt={moment.name || 'Moment'}
                                className={styles.thumbnail}
                            />
                        </div>
                        <div className={styles.momentMeta}>
                            <input 
                                type="text" 
                                value={moment.name || moment.filename || ''} 
                                onChange={(e) => onNameChange && onNameChange(moment.id, e.target.value)}
                                className={styles.momentNameInput}
                                placeholder="Untitled"
                            />
                            <button 
                                className={styles.deleteButton} 
                                onClick={() => onDelete && onDelete(moment.id)}
                                title="Delete Moment"
                            >
                                [Trash]
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MomentsRow;