import React, { useState, useEffect } from 'react';
import styles from './MomentsRow.module.css';
import Textarea from '../../../components/ui/Textarea';
import Input from '../../../components/ui/Input';

const MomentsRow = ({ 
    title, 
    subheader, 
    moments = [], 
    selectedIds = new Set(),
    onSelect,
    onMomentSelect, // Added this line
    onNameChange, 
    onDelete,
    onMomentHover,
    clusterId,
    clusterDescription,
    onClusterUpdate,
    readOnly = false,
    activeMomentId
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
                        {clusterId && !readOnly ? (
                            <Textarea
                                type="text"
                                className={styles.clusterTitleInput}
                                value={localTitle}
                                onChange={(e) => setLocalTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={(e) => handleKeyDown(e, 'name')}
                                placeholder="Cluster Name"
                            />
                        ) : (
                            <h4 className={styles.rowTitle}>{title}</h4>
                        )}
                        <span className={styles.rowSubheader}>{subheader}</span>
                    </div>
                    {clusterId && (
                        !readOnly ? (
                            <Textarea
                                type="text" 
                                className={styles.clusterDescriptionInput}
                                placeholder="Add description..."
                                value={localDescription}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setLocalDescription(e.target.value)}
                                onBlur={handleDescriptionBlur}
                                onKeyDown={(e) => handleKeyDown(e, 'description')}
                            />
                        ) : (
                             localDescription && <div style={{ fontSize: '0.95rem', color: '#555', marginTop: '0.2rem' }}>{localDescription}</div>
                        )
                    )}
                </div>
                
                {!readOnly && (
                    <input 
                        type="checkbox" 
                        className={styles.headerCheckbox}
                        checked={allSelected}
                        onChange={handleHeaderCheckboxChange}
                    />
                )}
            </div>
            
            <div className={styles.momentsGrid}>
                {moments.map((moment) => {
                    const isSelected = selectedIds.has(moment.id);
                    const isActive = moment.id === activeMomentId;
                    const handleClick = (e) => {
                        if (readOnly) {
                            onMomentSelect && onMomentSelect(moment);
                        } else {
                            onSelect && onSelect(moment.id, e.shiftKey);
                        }
                    };

                    return (
                        <div 
                            key={`moments-row-item-${moment.id}`} 
                            id={`moment-item-${moment.id}`}
                            className={`${styles.momentItem} ${isSelected ? styles.momentItemSelected : ''} ${isActive ? styles.momentItemActive : ''}`}
                            onMouseEnter={() => onMomentHover && onMomentHover(moment.id)}
                            onMouseLeave={() => onMomentHover && onMomentHover(null)}
                            onClick={handleClick}
                            style={{ cursor: readOnly ? (onMomentSelect ? 'pointer' : 'default') : 'pointer' }}
                        >
                            {!readOnly && isSelected && (
                                <div className={styles.selectionCheck}>✓</div>
                            )}
                            <div className={styles.thumbnailContainer}>
                                <img 
                                    src={`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${moment.storageThumbKey}`} 
                                    alt={moment.name || 'Moment'}
                                    className={styles.thumbnail}
                                />

                            </div>
                                <span>{moment.id || 'Moment'}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MomentsRow;