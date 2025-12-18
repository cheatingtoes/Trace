const MomentService = require('../services/moments.service');

const getAllMoments = async (req, res, next) => {
    try {
        const moments = await MomentService.getAllMoments();
        res.status(200).json(moments);
    } catch (error) {
        next(error);
    }
}

const getMomentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const moment = await MomentService.getMomentById(id);
        if (moment) {
            res.status(200).json(moment);
        } else {
            res.status(404).json({ message: 'Moment not found' });
        }
    } catch (error) {
        next(error);
    }
}

const createMoment = async (req, res, next) => {
    try {
        const newMoment = await MomentService.createMoment(req.body);
        res.status(201).json(newMoment);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllMoments,
    getMomentById,
    createMoment,
}
