// trace-backend/routes/cluster.routes.js
const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/cluster.controller');

router.post('/', clusterController.create);
router.get('/:id', clusterController.get);
router.patch('/:id', clusterController.update);
router.delete('/:id', clusterController.remove);

module.exports = router;