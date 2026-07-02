const express = require('express');

const router = express.Router();

const adminController = require('../controllers/adminRiderController');


// GET pending riders
router.get('/pendingRiders', adminController.getPendingRiders);

// Approve rider
router.patch('/approveRider/:id', adminController.approveRider);

// Reject rider
router.patch('/rejectRider/:id', adminController.rejectRider);


module.exports = router;