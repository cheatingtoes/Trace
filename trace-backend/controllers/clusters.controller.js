// trace-backend/services/cluster.service.js
const ClusterModel = require('../models/cluster.model');
const crypto = require('crypto');
const db = require('../config/db');

const createCluster = async (data) => {
    const { lat, lon, alt, ...rest } = data;
    
    const clusterData = {
        id: crypto.randomUUID(),
        ...rest
    };

    // Handle geometry if coordinates are provided
    if (lat !== undefined && lon !== undefined) {
        const altitude = alt || 0;
        // Create a 3D point (PointZ) with SRID 4326
        clusterData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lon, lat, altitude]);
    }

    return await ClusterModel.create(clusterData);
};

const updateCluster = async (id, data) => {
    const { lat, lon, alt, ...rest } = data;
    const updateData = { ...rest };

    if (lat !== undefined && lon !== undefined) {
        const altitude = alt || 0;
        updateData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lon, lat, altitude]);
    }

    return await ClusterModel.update(id, updateData);
};

const deleteCluster = async (id) => {
    return await ClusterModel.remove(id);
};

const getCluster = async (id) => {
    return await ClusterModel.findById(id);
};

module.exports = {
    createCluster,
    updateCluster,
    deleteCluster,
    getCluster
};