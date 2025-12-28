const { uuidv7 } = require('uuidv7');
const ActivityModel = require('../models/activities.model');
const TrackModel = require('../models/tracks.model');
const { cleanEmptyStrings } = require('../utils/helpers');
const { NotFoundError } = require('../errors/customErrors');


const getActivitiesByUserId = async (userId) => {
    return ActivityModel.getActivitiesByUserId(userId);
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



module.exports = {
    getActivitiesByUserId,
    getActivityById,
    createActivity,
    updateActivity,
};