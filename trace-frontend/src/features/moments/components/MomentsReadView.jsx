import React, { useMemo, useEffect } from 'react';
import styles from './MomentsEditView.module.css';
import MomentsRow from './MomentsRow';

const MomentsReadView = ({
    moments = [], 
    onMomentHover,
    onMomentSelect,
    scrollToMomentId,
    onScrollComplete
}) => {
    
    // Scroll Effect
    useEffect(() => {
        if (scrollToMomentId) {
            const element = document.getElementById(`moment-item-${scrollToMomentId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: Flash the element or highlight it temporarily
                element.classList.add(styles.flashHighlight);
                setTimeout(() => {
                    element.classList.remove(styles.flashHighlight);
                    if (onScrollComplete) onScrollComplete();
                }, 2000);
            }
        }
    }, [scrollToMomentId, onScrollComplete]);

    // Grouping Logic (Duplicated from MomentsEditView for read-only stability)
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
                    clusterDescription: moment.clusterDescription,
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>MOMENTS</h3>
            </div>
            
            <div className={styles.groupsContainer}>
                {momentGroups.map((group, index) => {
                    const firstMoment = group.moments[0];
                    const dateStr = formatDate(firstMoment.occuredAt);
                    
                    let title = 'Moments';
                    if (group.clusterId) {
                        title = firstMoment.clusterName || 'Cluster';
                    }
                    
                    const subheader = getGroupDateRange(group.moments);

                    return (
                        <MomentsRow
                            key={group.clusterId || `unclustered-${index}`}
                            title={title}
                            subheader={subheader}
                            moments={group.moments}
                            onMomentHover={onMomentHover}
                            clusterId={group.clusterId}
                            clusterDescription={group.clusterDescription}
                            readOnly={true}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MomentsReadView;