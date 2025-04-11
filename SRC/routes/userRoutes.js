const express = require('express');

const userController = require('../controllers/userController');

const router = express.Router();

router.post('/userSignup', userController.userSignup);
router.post('/userSignin', userController.userSignin);
router.post('/userSignout', userController.userSignout);

module.exports = router;