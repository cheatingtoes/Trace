const { uuidv7 } = require('uuidv7');
const ActivityModel = require('../models/activities.model');
const TrackModel = require('../models/tracks.model');


const getAllActivities = async () => {
    return ActivityModel.getAllActivities();
};

const getActivityById = async (id) => {
    return ActivityModel.getActivityById(id);
};

const createActivity = async (activityData) => {
    const id = uuidv7();
    return ActivityModel.createActivity({ id, ...activityData });
};

const getActivityRoutes = async (id) => {
    return TrackModel.getTracksByActivityId(id);
};

module.exports = {
    getAllActivities,
    getActivityById,
    createActivity,
    getActivityRoutes,
};