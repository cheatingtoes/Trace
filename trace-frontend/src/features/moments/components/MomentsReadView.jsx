import React, { useMemo, useEffect, useRef } from 'react';
import styles from './MomentsEditView.module.css';
import MomentsRow from './MomentsRow';

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

    // Scroll Sync Logic
    const containerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        const getScrollParent = (node) => {
            if (!node || node === document.body || node === document.documentElement) return null;
            
            const style = getComputedStyle(node);
            const overflowY = style.overflowY;
            const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
            
            if (isScrollable && node.scrollHeight >= node.clientHeight) {
                return node;
            }
            return getScrollParent(node.parentNode);
        };

        const handleScroll = () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {
                if (!containerRef.current) return;
                
                const scrollParent = getScrollParent(containerRef.current);
                // Fallback to window viewport if no specific scroll parent found (assuming body scroll)
                const parentRect = scrollParent 
                    ? scrollParent.getBoundingClientRect() 
                    : { top: 0, height: window.innerHeight };
                
                const centerY = parentRect.top + parentRect.height / 2;

                // Find all moment items
                const momentElements = Array.from(containerRef.current.querySelectorAll('[id^="moment-item-"]'));
                
                // Group by visual row to handle grid layouts
                const rows = [];
                const TOLERANCE = 5;
                let currentRow = null;

                momentElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    // Check if new row: if no current row, or top differs significantly
                    // Note: We assume DOM order matches visual order (top-left to bottom-right)
                    if (!currentRow || Math.abs(currentRow.top - rect.top) >= TOLERANCE) {
                        currentRow = { top: rect.top, height: rect.height, items: [] };
                        rows.push(currentRow);
                    }
                    currentRow.items.push({ el, rect });
                });

                let closestElement = null;
                let closestDistance = Infinity;

                rows.forEach(row => {
                    // Sort items by left position just in case (though DOM order is usually correct)
                    row.items.sort((a, b) => a.rect.left - b.rect.left);
                    
                    const count = row.items.length;
                    // Distribute row height among items
                    const sliceHeight = row.height / count;
                    
                    row.items.forEach((item, index) => {
                        // Virtual center for this item within the row's vertical space
                        const virtualCenterY = row.top + (index * sliceHeight) + (sliceHeight / 2);
                        const distance = Math.abs(centerY - virtualCenterY);

                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestElement = item.el;
                        }
                    });
                });

                if (closestElement) {
                    const momentId = closestElement.id.replace('moment-item-', '');
                    // Only trigger if changed and callback exists
                    if (onMomentCenter) {
                        onMomentCenter(momentId);
                    }
                }
            }, 10); // 100ms debounce
        };

        const scrollParent = getScrollParent(containerRef.current);
        const target = scrollParent || window;
        
        target.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            target.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [onMomentCenter]);

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
        <div className={styles.container} ref={containerRef}>
            <div className={styles.header}>
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