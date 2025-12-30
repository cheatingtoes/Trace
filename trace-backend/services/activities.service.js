const { uuidv7 } = require('uuidv7');
const ActivityModel = require('../models/activities.model');
const TrackModel = require('../models/tracks.model');
const ClustersModel = require('../models/clusters.model');
const { cleanEmptyStrings } = require('../utils/helpers');
const { NotFoundError } = require('../errors/customErrors');


const getActivitiesByUserId = async (userId) => {
    const activities = await ActivityModel.getActivitiesByUserId(userId);

    if (!activities || activities.length === 0) {
        return [];
    }

    const activityIds = activities.map(a => a.id);

    const [tracks, clusters] = await Promise.all([
        TrackModel.getTracksByActivityIds(activityIds),
        ClustersModel.getClustersByActivityIds(activityIds)
    ]);

    // Create maps for faster lookup
    const tracksMap = tracks.reduce((acc, track) => {
        if (!acc[track.activityId]) acc[track.activityId] = [];
        // Parse polyline if it's a string (GeoJSON) - though knex converter might handle some things, 
        // ST_AsGeoJSON returns string usually.
        if (track.polyline && typeof track.polyline === 'string') {
            try {
                track.polyline = JSON.parse(track.polyline);
            } catch (e) {
                console.error('Error parsing polyline JSON', e);
            }
        }
        acc[track.activityId].push(track);
        return acc;
    }, {});

    const clustersMap = clusters.reduce((acc, cluster) => {
        if (!acc[cluster.activityId]) acc[cluster.activityId] = [];
        acc[cluster.activityId].push(cluster);
        return acc;
    }, {});

    // Attach to activities
    return activities.map(activity => ({
        ...activity,
        tracks: tracksMap[activity.id] || [],
        clusters: clustersMap[activity.id] || []
    }));
};

const getActivityById = async (id) => {
    return ActivityModel.getActivityById(id);
};

const createActivity = async (activityData, userId) => {
    const activityToCreate = cleanEmptyStrings({ ...activityData, userId, id: uuidv7() });
    const [newActivity] = await ActivityModel.createActivity(activityToCreate);
    return newActivity;
};

const updateActivity = async (id, activityData) => {
    const [updatedActivity] = await ActivityModel.updateActivity(id, activityData);
    if (updatedActivity) {
        return updatedActivity;
    } else {
        throw new NotFoundError('Activity not found');
    }
};

const deleteActivity = async (id) => {
    const [deletedActivity] = await ActivityModel.deleteActivity(id);
    if (deletedActivity) {
        return deleteActivity;
    } else {
        throw new NotFoundError('Activity not found');
    }
};



module.exports = {
    getActivitiesByUserId,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
};