const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyRider, requireApprovedRider } = require('../middlewares/riderAuth');

// Customer routes
router.post('/createOrder', orderController.createOrder);
router.get('/orders/:customerId', orderController.getUserOrders);
router.get('/order/:orderId', orderController.getOrderById);
router.get('/dashboard/:customerId', orderController.getDashboardStats);

// Rider routes — all require verified, approved rider
router.get('/rider/orders/available', verifyRider, requireApprovedRider, orderController.getAvailableOrders);
router.get('/rider/stats', verifyRider, requireApprovedRider, orderController.getRiderStats);
router.patch('/rider/orders/:orderId/accept', verifyRider, requireApprovedRider, orderController.acceptOrder);
router.patch('/rider/orders/:orderId/pickup', verifyRider, requireApprovedRider, orderController.markPickedUp);
router.patch('/rider/orders/:orderId/deliver', verifyRider, requireApprovedRider, orderController.markDelivered);

module.exports = router;