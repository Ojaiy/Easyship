const express = require('express');

const vendorController = require('../controllers/vendorController');

const router = express.Router();

router.post('/vendorSignup', vendorController.vendorSignup);

module.exports = router;