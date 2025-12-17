const PolylineService = require('../services/polylines.service');

const getAllPolylines = async (req, res, next) => {
    try {
        const polylines = await PolylineService.getAllPolylines();
        res.status(200).json(polylines);
    } catch (error) {
        next(error);
    }
}

const getPolylineById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const polyline = await PolylineService.getPolylineById(id);
        if (polyline) {
            res.status(200).json(polyline);
        } else {
            res.status(404).json({ message: 'Polyline not found' });
        }
    } catch (error) {
        next(error);
    }
}

const createPolyline = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const newPolyline = await PolylineService.createPolyline({ name, email });
        res.status(201).json(newPolyline);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllPolylines,
    getPolylineById,
    createPolyline,
}