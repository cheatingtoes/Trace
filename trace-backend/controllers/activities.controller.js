const ActivityService = require('../services/activities.service');

const getAllActivities = async (req, res, next) => {
    try {
        const activities = await ActivityService.getAllActivities();
        res.status(200).json(activities);
    } catch (error) {
        next(error);
    }
}

const getActivityById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activity = await ActivityService.getActivityById(id);
        if (activity) {
            res.status(200).json(activity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        next(error);
    }
}

const createActivity = async (req, res, next) => {
    try {
        const newActivity = await ActivityService.createActivity(req.body);
        res.status(201).json(newActivity);
    } catch (error) {
        next(error);
    }
}

const getActivityRoutes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activityRoutes = await ActivityService.getActivityRoutes(id);
        res.status(200).json(activityRoutes);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllActivities,
    getActivityById,
    createActivity,
    getActivityRoutes,
}
