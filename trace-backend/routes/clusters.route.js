// trace-backend/routes/cluster.routes.js
const express = require('express');
const router = express.Router();
const ClustersController = require('../controllers/clusters.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.post('/', ClustersController.createCluster);
router.get('/:id', ClustersController.getCluster);
router.patch('/:id', ClustersController.updateCluster);
router.delete('/:id', ClustersController.deleteCluster);

module.exports = router;