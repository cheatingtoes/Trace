import React, { useRef, useState, useMemo } from 'react';
import styles from './MomentsEditView.module.css';
import MomentsRow from './MomentsRow';

const MomentsEditView = ({ 
    moments = [], 
    onUpload, 
    onDelete,
    onNameChange,
    onMomentHover
}) => {
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0 && onUpload) {
            onUpload(files);
        }
        // Reset input
        e.target.value = null;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files || []);
        setIsDragOver(false);
        if (files.length > 0 && onUpload) {
            onUpload(files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    // Group moments by cluster_id
    const momentGroups = useMemo(() => {
        if (!moments || moments.length === 0) return [];

        const groups = [];
        let currentGroup = {
            clusterId: moments[0].cluster_id,
            moments: [moments[0]]
        };

        for (let i = 1; i < moments.length; i++) {
            const moment = moments[i];
            if (moment.cluster_id !== currentGroup.clusterId) {
                groups.push(currentGroup);
                currentGroup = {
                    clusterId: moment.cluster_id,
                    moments: [moment]
                };
            } else {
                currentGroup.moments.push(moment);
            }
        }
        groups.push(currentGroup);
        return groups;
    }, [moments]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getGroupDateRange = (groupMoments) => {
        if (!groupMoments || groupMoments.length === 0) return '';
        const first = groupMoments[0].occuredAt;
        const last = groupMoments[groupMoments.length - 1].occuredAt;
        
        if (!first) return '';
        const start = formatDate(first);
        if (!last || first === last) return start;
        
        const end = formatDate(last);
        return start === end ? start : `${start} - ${end}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>MOMENTS</h3>
            </div>
            
            <div 
                className={styles.uploadZone}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={isDragOver ? { backgroundColor: 'rgba(0, 123, 255, 0.1)', borderColor: '#007bff' } : {}}
                onClick={(e) => {
                    if (e.target.closest('button') || e.target.tagName === 'INPUT') {
                        return;
                    }
                    fileInputRef.current?.click();
                }}
            >
                <div className={styles.uploadActions}>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.uploadBtn}
                    >
                        [ + Upload Files ]
                    </button>
                    <button 
                        onClick={() => folderInputRef.current?.click()}
                        className={styles.uploadBtn}
                    >
                        [ + Upload Folder ]
                    </button>
                </div>
                <span className={styles.uploadText}>or Drop Files Here</span>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    multiple={true}
                    accept="image/*,video/*,audio/*"
                    style={{ display: 'none' }} 
                />
                
                <input 
                    type="file" 
                    ref={folderInputRef} 
                    onChange={handleFileChange} 
                    {...{ webkitdirectory: "", directory: "" }}
                    style={{ display: 'none' }} 
                />
            </div>

            <div className={styles.groupsContainer}>
                {momentGroups.map((group, index) => {
                    // Try to get title from the first moment if it has populated cluster info
                    // Otherwise default based on clusterId presence
                    const title = group.clusterId 
                        ? (group.moments[0].cluster?.title || 'Cluster') 
                        : 'Unclustered Moments';
                    
                    const subheader = getGroupDateRange(group.moments);

                    return (
                        <MomentsRow
                            key={group.clusterId || `unclustered-${index}`}
                            title={title}
                            subheader={subheader}
                            moments={group.moments}
                            onNameChange={onNameChange}
                            onDelete={onDelete}
                            onMomentHover={onMomentHover}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MomentsEditView;