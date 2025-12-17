const TrackService = require('../services/tracks.service');

const getAllTracks = async (req, res, next) => {
    try {
        const tracks = await TrackService.getAllTracks();
        res.status(200).json(tracks);
    } catch (error) {
        next(error);
    }
}

const getTrackById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const track = await TrackService.getTrackById(id);
        if (track) {
            res.status(200).json(track);
        } else {
            res.status(404).json({ message: 'Track not found' });
        }
    } catch (error) {
        next(error);
    }
}

const createTrack = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const newTrack = await TrackService.createTrack({ name, email });
        res.status(201).json(newTrack);
    } catch (error) {
        next(error);
    }
}

const uploadGPX = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { file } = req;   // Assuming the file is uploaded using a middleware like multer and is available in req.file

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        if (!id) {
            return res.status(400).json({ message: 'Track ID is required.' });
        }
        const result = await TrackService.uploadGPX(id, file);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    } finally {
        if (req.file) {
            fs.unlinkSync(req.file.path);  // Clean up the uploaded file
        }
    }
}


module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    uploadGPX
}