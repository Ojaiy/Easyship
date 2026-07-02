const express = require('express');

const riderController =
    require('../controllers/riderController');

const upload =
    require('../middlewares/uploadMiddleware');

   const { verifyRider } = require('../middlewares/riderAuth');


const router = express.Router();

router.post(

    '/riderSignup',

    upload.fields([
        {
            name: 'profilePhoto',
            maxCount: 1
        },
        {
            name: 'driversLicense',
            maxCount: 1
        },
        {
            name: 'governmentId',
            maxCount: 1
        },
        {
            name: 'vehicleRegistration',
            maxCount: 1
        },
        {
            name: 'vehiclePhoto',
            maxCount: 1
        }
    ]),

    riderController.riderSignup

);

router.get('/rider/status', verifyRider, riderController.getRiderStatus);

module.exports = router;