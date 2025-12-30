const ActivityService = require('../services/activities.service');
const TracksService = require('../services/tracks.service');
const MomentsService = require('../services/moments.service');
const ClustersService = require('../services/clusters.service');
const { success } = require('../utils/apiResponse');


const getActivitiesForUser = async (req, res, next) => {
    try {
        const activities = await ActivityService.getActivitiesByUserId(req.user.id);
        res.status(200).json(success(activities));
    } catch (error) {
        next(error);
    }
}

const getActivityById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activity = await ActivityService.getActivityById(id);
        if (activity) {
            res.status(200).json(success(activity));
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        next(error);
    }
}

const updateActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedActivity = await ActivityService.updateActivity(id, req.body);
        res.status(200).json(success(updatedActivity));
    } catch (error) {
        next(error);
    }
};

const createActivity = async (req, res, next) => {
    try {
        const newActivity = await ActivityService.createActivity(req.body, req.user.id);
        res.status(201).json(success(newActivity));
    } catch (error) {
        next(error);
    }
}

const deleteActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedActivity = await ActivityService.deleteActivity(id);
        res.status(200).json(success(deletedActivity));
    } catch (error) {
        next(error);
    }
};

const getTracksByActivityId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activityRoutes = await TracksService.getTracksByActivityId(id);
        res.status(200).json(success(activityRoutes));
    } catch (error) {
        next(error);
    }
}

const deleteTracksByActivityId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedTracks = await TracksService.deleteTracksByActivityId(id);
        res.status(200).json(success(deletedTracks));
    } catch (error) {
        next(error);
    }
}

const getMomentsByActivityId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activityMoments = await MomentsService.getMomentsByActivityId(id);
        res.status(200).json(success(activityMoments));
    } catch (error) {
        next(error);
    }
}

const deleteMomentsByActivityId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedMoments = await MomentsService.deleteMomentsByActivityId(id);
        res.status(200).json(success(deletedMoments));
    } catch (error) {
        next(error);
    }
}

const getClustersByActivityId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activityClusters = await ClustersService.getClustersByActivityId(id);
        res.status(200).json(success(activityClusters));
    } catch (error) {
        next(error);
    }
}

const deleteClustersByActivityId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedClusters = await ClustersService.deleteClustersByActivityId(id);
        res.status(200).json(success(deletedClusters));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getActivitiesForUser,
    getActivityById,
    createActivity,
    deleteActivity,
    updateActivity,
    getTracksByActivityId,
    deleteTracksByActivityId,
    getMomentsByActivityId,
    deleteMomentsByActivityId,
    getClustersByActivityId,
    deleteClustersByActivityId,
}
