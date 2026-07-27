const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

const verifyUser = require('../middlewares/userAuth');
const { verifyRider, requireApprovedRider } = require('../middlewares/riderAuth');

// CUSTOMER ROUTES

router.post('/createOrder', verifyUser, orderController.createOrder);

router.get('/orders', verifyUser, orderController.getUserOrders);

router.get('/order/:orderId', verifyUser, orderController.getOrderById);

router.get('/dashboard', verifyUser, orderController.getDashboardStats);

// RIDER ROUTES


router.get(
    '/rider/orders/available',
    verifyRider,
    requireApprovedRider,
    orderController.getAvailableOrders
);

router.get(
    '/rider/stats',
    verifyRider,
    requireApprovedRider,
    orderController.getRiderStats
);

router.patch(
    '/rider/orders/accept',
    verifyRider,
    requireApprovedRider,
    orderController.acceptOrder
);

router.patch(
    '/rider/orders/pickup',
    verifyRider,
    requireApprovedRider,
    orderController.markPickedUp
);

router.patch(
    '/rider/orders/deliver',
    verifyRider,
    requireApprovedRider,
    orderController.markDelivered
);

module.exports = router;