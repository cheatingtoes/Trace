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
// trace-backend/controllers/cluster.controller.js
const clusterService = require('../services/cluster.service');

const create = async (req, res, next) => {
    try {
        const cluster = await clusterService.createCluster(req.body);
        res.status(201).json(cluster);
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cluster = await clusterService.getCluster(id);
        if (!cluster) {
            return res.status(404).json({ message: 'Cluster not found' });
        }
        res.json(cluster);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cluster = await clusterService.updateCluster(id, req.body);
        if (!cluster) {
            return res.status(404).json({ message: 'Cluster not found' });
        }
        res.json(cluster);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await clusterService.deleteCluster(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    get,
    update,
    remove
};