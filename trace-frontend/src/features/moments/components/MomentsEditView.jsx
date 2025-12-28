import React, { useRef, useState, useMemo } from 'react';
import api from '../../../api/axios';
import styles from './MomentsEditView.module.css';
import MomentsRow from './MomentsRow';
import FloatingActionBar from './FloatingActionBar';
import TimeShiftModal from './TimeShiftModal';

const MomentsEditView = ({
    moments = [], 
    onUpload, 
    onDelete,
    onNameChange,
    onUpdateMoment,
    onMomentHover,
    onMomentSelect,
    onFetchMoments,
    activityId
}) => {
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    // Selection State
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [lastClickedId, setLastClickedId] = useState(null);
    
    // Modal State
    const [isTimeShiftOpen, setIsTimeShiftOpen] = useState(false);

    // Grouping Logic
    const momentGroups = useMemo(() => {
        if (!moments || moments.length === 0) return [];

        const groups = [];
        let currentGroup = null;

        moments.forEach((moment) => {
            let shouldStartNewGroup = false;
            // Normalize to null if falsy (undefined, null, "")
            const momentClusterId = moment.clusterId || null;

            if (!currentGroup) {
                shouldStartNewGroup = true;
            } else {
                const groupClusterId = currentGroup.clusterId || null;

                // 1. Check if Cluster ID changed
                if (momentClusterId !== groupClusterId) {
                    shouldStartNewGroup = true;
                } 
                // 2. If both are unclustered, check if Day changed
                else if (momentClusterId === null) {
                    const currentDay = currentGroup.moments[0].occuredAt 
                        ? new Date(currentGroup.moments[0].occuredAt).toDateString()
                        : 'Unknown';
                    const momentDay = moment.occuredAt 
                        ? new Date(moment.occuredAt).toDateString()
                        : 'Unknown';
                    
                    if (currentDay !== momentDay) {
                        shouldStartNewGroup = true;
                    }
                }
            }

            if (shouldStartNewGroup) {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = {
                    clusterId: momentClusterId,
                    clusterDescription: moment.cluster_description,
                    moments: [moment]
                };
            } else {
                currentGroup.moments.push(moment);
            }
        });
        
        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, [moments]);

    // Helpers
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

    // Handlers
    const handleClusterUpdate = async (clusterId, updates) => {
        try {
            await api.patch(`/clusters/${clusterId}`, updates);
            if (onFetchMoments) onFetchMoments();
        } catch (err) {
            console.error('Failed to update cluster', err);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0 && onUpload) onUpload(files);
        e.target.value = null;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files || []);
        setIsDragOver(false);
        if (files.length > 0 && onUpload) onUpload(files);
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

    // Selection Logic
    const handleSelect = (idOrIds, shiftKey, forceSelect) => {
        const newSelected = new Set(selectedIds);

        if (Array.isArray(idOrIds)) {
            // Bulk select/deselect (from Row Header)
            idOrIds.forEach(id => {
                if (forceSelect) newSelected.add(id);
                else newSelected.delete(id);
            });
            setLastClickedId(null);
        } else {
            const id = idOrIds;
            if (shiftKey && lastClickedId && moments.some(m => m.id === lastClickedId)) {
                // Range Select
                const lastIdx = moments.findIndex(m => m.id === lastClickedId);
                const currIdx = moments.findIndex(m => m.id === id);
                const start = Math.min(lastIdx, currIdx);
                const end = Math.max(lastIdx, currIdx);
                
                for (let i = start; i <= end; i++) {
                    newSelected.add(moments[i].id);
                }
                if (onMomentSelect) onMomentSelect(id);
            } else {
                // Toggle
                if (newSelected.has(id)) {
                    newSelected.delete(id);
                } else {
                    newSelected.add(id);
                    if (onMomentSelect) onMomentSelect(id);
                }
            }
            setLastClickedId(id);
        }
        setSelectedIds(newSelected);
    };
    const handleDeselectAll = () => {
        setSelectedIds(new Set());
        setLastClickedId(null);
    };

    // Actions
    const handleDeleteSelected = async () => {
        const idsToDelete = Array.from(selectedIds);
        handleDeselectAll(); // Optimistically clear selection
        await Promise.all(idsToDelete.map(id => onDelete(id)));
    };

    const handleTimeShift = async (minutes) => {
        if (minutes === 0) return;
        
        const ids = Array.from(selectedIds);
        const updates = ids.map(id => {
            const m = moments.find(m => m.id === id);
            if (!m || !m.occuredAt) return null;
            const newTime = new Date(new Date(m.occuredAt).getTime() + minutes * 60000);
            return { id, capturedAt: newTime.toISOString() };
        }).filter(Boolean);

        await Promise.all(updates.map(u => onUpdateMoment(u.id, { occuredAt: u.capturedAt })));
        if (onFetchMoments) onFetchMoments();
    };

    // Center Action Logic
    const getCenterAction = () => {
        if (selectedIds.size === 0) return null;

        // Check continuity
        const selectedList = moments.filter(m => selectedIds.has(m.id));
        if (selectedList.length !== selectedIds.size) return null;

        const indices = selectedList.map(m => moments.findIndex(orig => orig.id === m.id)).sort((a, b) => a - b);
        const isContiguous = indices.every((val, i, arr) => i === 0 || val === arr[i-1] + 1);

        if (!isContiguous) return null;

        const allUnclustered = selectedList.every(m => m.clusterId === null);
        const allClustered = selectedList.every(m => m.clusterId !== null);
        const uniqueClusterIds = new Set(selectedList.map(m => m.clusterId).filter(id => id !== null));

        // 1. Create Cluster
        if (allUnclustered) {
            return {
                label: 'Create Cluster',
                onClick: async () => {
                    try {
                        const res = await api.post('/clusters', { 
                            name: 'New Cluster', 
                            activityId 
                        });
                        const clusterId = res.data.id;
                        await Promise.all(selectedList.map(m => onUpdateMoment(m.id, { clusterId })));
                        handleDeselectAll();
                    } catch (err) {
                        console.error(err);
                        alert('Failed to create cluster');
                    }
                }
            };
        }

        // 2. Ungroup
        if (allClustered && uniqueClusterIds.size === 1) {
            return {
                label: 'Ungroup',
                onClick: async () => {
                    await Promise.all(selectedList.map(m => onUpdateMoment(m.id, { clusterId: null })));
                    handleDeselectAll();
                }
            };
        }

        // 3. Merge
        if ((!allUnclustered && !allClustered) || uniqueClusterIds.size > 1) {
             return {
                label: 'Merge to New Cluster',
                onClick: async () => {
                     try {
                        const res = await api.post('/clusters', { 
                            activityId 
                        });
                        const clusterId = res.data.id;
                        await Promise.all(selectedList.map(m => onUpdateMoment(m.id, { clusterId })));
                        handleDeselectAll();
                    } catch (err) {
                        console.error(err);
                        alert('Failed to merge');
                    }
                }
            };
        }

        return null;
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
                    const firstMoment = group.moments[0];
                    const dateStr = formatDate(firstMoment.occuredAt);
                    
                    let title = 'Unclustered Moments';
                    if (group.clusterId) {
                        title = firstMoment.clusterName || 'Cluster';
                    } else {
                        title = `Unclustered Moments - ${dateStr}`;
                    }
                    
                    const subheader = getGroupDateRange(group.moments);

                    return (
                        <MomentsRow
                            key={group.clusterId || `unclustered-${index}`}
                            title={title}
                            subheader={subheader}
                            moments={group.moments}
                            selectedIds={selectedIds}
                            onSelect={handleSelect}
                            onNameChange={onNameChange}
                            onDelete={onDelete}
                            onMomentHover={onMomentHover}
                            clusterId={group.clusterId}
                            clusterDescription={group.clusterDescription}
                            onClusterUpdate={handleClusterUpdate}
                        />
                    );
                })}
            </div>

            <FloatingActionBar 
                selectedCount={selectedIds.size}
                onDeselectAll={handleDeselectAll}
                onDelete={handleDeleteSelected}
                onTimeShift={() => setIsTimeShiftOpen(true)}
                centerAction={getCenterAction()}
            />

            <TimeShiftModal 
                isOpen={isTimeShiftOpen}
                onClose={() => setIsTimeShiftOpen(false)}
                onConfirm={handleTimeShift}
            />
        </div>
    );
};

export default MomentsEditView;