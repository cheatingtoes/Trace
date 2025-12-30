const { uuidv7 } = require('uuidv7');
const ClustersModel = require('../models/clusters.model');
const { NotFoundError } = require('../errors/customErrors');

const createCluster = async (data) => {
    const { lat, lon, alt, ...rest } = data;
    
    const clusterData = {
        id: uuidv7(),
        ...rest
    };

    // Handle geometry if coordinates are provided
    if (lat !== undefined && lon !== undefined) {
        const altitude = alt || 0;
        // Create a 3D point (PointZ) with SRID 4326
        clusterData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lon, lat, altitude]);
    }

    const [cluster] = await ClustersModel.createCluster(clusterData);
    return cluster

};

const updateCluster = async (id, data) => {
    const { lat, lon, alt, ...rest } = data;
    const updateData = { ...rest };

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

module.exports = {
    createCluster,
    updateCluster,
    deleteCluster,
    findById,
    findClusterForMoment
};