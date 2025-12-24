const PolylineService = require('../services/polylines.service');
const { success } = require('../utils/apiResponse');
const { NotFoundError } = require('../errors/customErrors');

const getAllPolylines = async (req, res, next) => {
    try {
        const polylines = await PolylineService.getAllPolylines();
        res.status(200).json(success(polylines));
    } catch (error) {
        next(error);
    }
}

const getPolylineById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const polyline = await PolylineService.getPolylineById(id);
        if (polyline) {
            res.status(200).json(success(polyline));
        } else {
            throw new NotFoundError('Polyline not found');
        }
    } catch (error) {
        next(error);
    }
}

const createPolyline = async (req, res, next) => {
    try {
        const newPolyline = await PolylineService.createPolyline(req.body);
        res.status(201).json(success(newPolyline));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllPolylines,
    getPolylineById,
    createPolyline,
}
