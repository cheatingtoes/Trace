const MomentModel = require('../models/moments.model');

const getAllMoments = async () => {
    return MomentModel.getAllMoments();
};

const getMomentById = async (id) => {
    return MomentModel.getMomentById(id);
};

const createMoment = async (momentData) => {
    return MomentModel.createMoment(momentData);
};

module.exports = {
  getAllMoments,
  getMomentById,
  createMoment,
};