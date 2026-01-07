import React, { useRef } from 'react';
import styles from './MomentsEditView.module.css';
import MomentsRow from './MomentsRow';
import useMomentGrouping from '../hooks/useMomentGrouping';
import useMomentScroll from '../hooks/useMomentScroll';

const MomentsReadView = ({
    moments = [], 
    onMomentHover,
    onMomentSelect,
    scrollToMomentId,
    onScrollComplete,
    isScrollSyncEnabled,
    onToggleScrollSync,
    onMomentCenter,
    activeMomentId
}) => {
    const containerRef = useRef(null);

    useMomentScroll({
        scrollToMomentId,
        onScrollComplete,
        onMomentCenter,
        containerRef,
        flashHighlightClassName: styles.flashHighlight
    });

    const momentGroups = useMomentGrouping(moments);

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
        <div className={styles.container} ref={containerRef}>
            <div className={styles.header} style={{ pointerEvents: 'none' }}>
                <h3>MOMENTS</h3>
                {onToggleScrollSync && (
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={isScrollSyncEnabled}
                                onChange={onToggleScrollSync}
                            />
                            <span style={{ marginLeft: '5px' }}>Sync Map</span>
                        </label>
                    </div>
                )}
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
                            key={`moment-read-view-${index}`}
                            title={title}
                            subheader={subheader}
                            moments={group.moments}
                            onMomentHover={onMomentHover}
                            onMomentSelect={onMomentSelect}
                            clusterId={group.clusterId}
                            clusterDescription={group.clusterDescription}
                            readOnly={true}
                            activeMomentId={activeMomentId}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MomentsReadView;