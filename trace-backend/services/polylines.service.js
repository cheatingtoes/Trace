const PolylineModel = require('../models/polylines.model');

const getAllPolylines = async () => {
    return PolylineModel.getAllPolylines();
};

const getPolylineById = async (id) => {
    return PolylineModel.getPolylineById(id);
};

const createUser = async (polyLineData) => {
    return PolylineModel.createUser(polyLineData);
};

module.exports = {
  getAllPolylines,
  getPolylineById,
  createUser,
};