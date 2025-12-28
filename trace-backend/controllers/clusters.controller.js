// trace-backend/services/cluster.service.js
const ClustersService = require('../services/clusters.service');
const db = require('../config/db');
const { success } = require('../utils/apiResponse');

const createCluster = async (req, res, next) => {
    try {
        const { activityId, name } = req.body;
        const cluster = await ClustersService.createCluster(req.body);
        res.status(201).json(success(cluster));
    } catch (error) {
        next(error);
    }

    // const { lat, lon, alt, ...rest } = data;

    // console.error('in create cluster')
    
    // const clusterData = {
    //     id: crypto.randomUUID(),
    //     ...rest
    // };

    // // Handle geometry if coordinates are provided
    // if (lat !== undefined && lon !== undefined) {
    //     const altitude = alt || 0;
    //     // Create a 3D point (PointZ) with SRID 4326
    //     clusterData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lon, lat, altitude]);
    // }

    // return await ClustersService.create(clusterData);
};

const updateCluster = async (req, res, next) => {
    const { id } = req.params;

    const cluster = await ClustersService.updateCluster(id, req.body);
    res.status(200).json(success(cluster));
};

const deleteCluster = async (id) => {
    return await ClustersService.remove(id);
};

const findById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cluster = await ClustersService.findById(id);
        res.status(200).json(success(cluster));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCluster,
    updateCluster,
    deleteCluster,
    findById
};