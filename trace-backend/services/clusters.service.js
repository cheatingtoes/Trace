const { uuidv7 } = require('uuidv7');
const ClustersModel = require('../models/clusters.model');
const MomentsModel = require('../models/moments.model');
const { NotFoundError } = require('../errors/customErrors');
const db = require('../config/db');

const createCluster = async (data) => {
    const { lat, lon, alt, selectedIds, ...rest } = data;
    
    const clusterData = {
        id: uuidv7(),
        ...rest
    };

    if (selectedIds && selectedIds.length > 0) {
        // Find min/max occuredAt from selected moments
        const moments = await MomentsModel.getMomentByIds(Array.from(selectedIds));
        if (moments.length > 0) {
            const timestamps = moments.map(m => new Date(m.occuredAt).getTime()).filter(t => !isNaN(t));
            if (timestamps.length > 0) {
                clusterData.start_date = new Date(Math.min(...timestamps));
                clusterData.end_date = new Date(Math.max(...timestamps));
            }
            const geom = moments.map(({ geom }) => geom).filter(geom => geom);
            if (geom.length > 0) {
                clusterData.geom = geom[0];
            }
        }
    }

    // Handle geometry if coordinates are provided
    if (lat !== undefined && lon !== undefined) {
        const altitude = alt || 0;
        // Create a 3D point (PointZ) with SRID 4326
        clusterData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lon, lat, altitude]);
    }

    const [cluster] = await ClustersModel.createCluster(clusterData);
    return cluster;
};

const updateCluster = async (id, data) => {
    const { lat, lon, alt, selectedIds, ...rest } = data;
    const updateData = { ...rest };

    if (selectedIds && selectedIds.length > 0) {
        const moments = await MomentsModel.getMomentByIds(Array.from(selectedIds));
        if (moments.length > 0) {
            const timestamps = moments.map(m => new Date(m.occuredAt).getTime()).filter(t => !isNaN(t));
            
            if (timestamps.length > 0) {
                const newStart = Math.min(...timestamps);
                const newEnd = Math.max(...timestamps);

                const currentCluster = await ClustersModel.findById(id);
                if (currentCluster) {
                    const currentStart = currentCluster.start_date ? new Date(currentCluster.start_date).getTime() : Infinity;
                    const currentEnd = currentCluster.end_date ? new Date(currentCluster.end_date).getTime() : -Infinity;

                    updateData.start_date = new Date(Math.min(currentStart, newStart));
                    updateData.end_date = new Date(Math.max(currentEnd, newEnd));
                } else {
                    updateData.start_date = new Date(newStart);
                    updateData.end_date = new Date(newEnd);
                }
            }
            const geom = moments.map(({ geom }) => geom).filter(geom => geom);
            if (geom.length > 0) {
                updateData.geom = geom[0];
            }
        }
    }
    
    if (lat !== undefined && lon !== undefined) {
        const altitude = alt || 0;
        updateData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lon, lat, altitude]);
    }

    return await ClustersModel.update(id, updateData);
};

const deleteCluster = async (id) => {
    return await ClustersModel.remove(id);
};

const findById = async (id) => {
    return await ClustersModel.findById(id);
};

const findClusterForMoment = async (activityId, occuredAt) => {
    return await ClustersModel.findClusterForMoment(activityId, occuredAt);
}

const getClustersByActivityId = async (activityId) => {
    return await ClustersModel.getClustersByActivityId(activityId);
};

const deleteClustersByActivityId = async (activityId) => {
    return await ClustersModel.deleteClustersByActivityId(activityId);
};

module.exports = {
    createCluster,
    updateCluster,
    deleteCluster,
    findById,
    findClusterForMoment,
    getClustersByActivityId,
    deleteClustersByActivityId
};