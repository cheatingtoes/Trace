const PolylineModel = require('../models/polylines.model');

const getAllPolylines = async () => {
    return PolylineModel.getAllPolylines();
};

const getPolylineById = async (id) => {
    return PolylineModel.getPolylineById(id);
};

const createPolyline = async (polyLineData) => {
    const id = uuidv7();
    return PolylineModel.createPolyline({ id, ...polyLineData });
};

module.exports = {
  getAllPolylines,
  getPolylineById,
  createPolyline,
};