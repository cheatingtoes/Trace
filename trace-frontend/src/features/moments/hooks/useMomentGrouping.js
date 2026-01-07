import { useMemo } from 'react';

export const useMomentGrouping = (moments) => {
    return useMemo(() => {
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
};

export default useMomentGrouping;
