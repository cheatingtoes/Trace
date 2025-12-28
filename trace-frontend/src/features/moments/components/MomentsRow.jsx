import React, { useState, useEffect } from 'react';
import styles from './MomentsRow.module.css';

const MomentsRow = ({ 
    title, 
    subheader, 
    moments = [], 
    selectedIds = new Set(),
    onSelect,
    onNameChange, 
    onDelete,
    onMomentHover,
    clusterId,
    clusterDescription,
    onClusterUpdate
}) => {
    // Local state for inputs to prevent re-render issues and optimize API calls
    const [localTitle, setLocalTitle] = useState(title);
    const [localDescription, setLocalDescription] = useState(clusterDescription || '');

    useEffect(() => {
        setLocalTitle(title);
    }, [title]);

    useEffect(() => {
        setLocalDescription(clusterDescription || '');
    }, [clusterDescription]);

    // Check if all moments in this row are selected
    const allSelected = moments.length > 0 && moments.every(m => selectedIds.has(m.id));

    const handleHeaderCheckboxChange = () => {
        if (!onSelect) return;
        const ids = moments.map(m => m.id);
        onSelect(ids, false, !allSelected); // Pass list of IDs and forceSelect state
    };

    const handleTitleBlur = () => {
        if (clusterId && onClusterUpdate && localTitle !== title) {
            onClusterUpdate(clusterId, { name: localTitle });
        }
    };

    const handleDescriptionBlur = () => {
        if (clusterId && onClusterUpdate && localDescription !== (clusterDescription || '')) {
            onClusterUpdate(clusterId, { description: localDescription });
        }
    };

    const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Trigger blur to save
        }
    };

    return (
        <div className={styles.rowContainer}>
            <div className={styles.rowHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerText}>
                        {clusterId ? (
                            <input
                                type="text"
                                className={styles.clusterTitleInput}
                                value={localTitle}
                                onChange={(e) => setLocalTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={(e) => handleKeyDown(e, 'title')}
                                placeholder="Cluster Name"
                            />
                        ) : (
                            <h4 className={styles.rowTitle}>{title}</h4>
                        )}
                        <span className={styles.rowSubheader}>{subheader}</span>
                    </div>
                    
                    {clusterId && (
                        <input 
                            type="text" 
                            className={styles.clusterDescriptionInput}
                            placeholder="Add description..."
                            value={localDescription}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setLocalDescription(e.target.value)}
                            onBlur={handleDescriptionBlur}
                            onKeyDown={(e) => handleKeyDown(e, 'description')}
                        />
                    )}
                </div>
                
                <input 
                    type="checkbox" 
                    className={styles.headerCheckbox}
                    checked={allSelected}
                    onChange={handleHeaderCheckboxChange}
                />
            </div>
            
            <div className={styles.momentsGrid}>
                {moments.map((moment) => {
                    const isSelected = selectedIds.has(moment.id);
                    return (
                        <div 
                            key={moment.id} 
                            className={`${styles.momentItem} ${isSelected ? styles.momentItemSelected : ''}`}
                            onMouseEnter={() => onMomentHover && onMomentHover(moment.id)}
                            onMouseLeave={() => onMomentHover && onMomentHover(null)}
                            onClick={(e) => onSelect && onSelect(moment.id, e.shiftKey)}
                        >
                            {isSelected && (
                                <div className={styles.selectionCheck}>✓</div>
                            )}
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
                                    onClick={(e) => e.stopPropagation()}
                                    className={styles.momentNameInput}
                                    placeholder="Untitled"
                                />
                                <button 
                                    className={styles.deleteButton} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete && onDelete(moment.id);
                                    }}
                                    title="Delete Moment"
                                >
                                    [Trash]
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MomentsRow;