const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyUser = require('../middlewares/userAuth');

// Webhook — NO auth middleware, Paystack calls this directly
// Must be raw body for signature verification
router.post(
    '/payment/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.paystackWebhook
);

// All other payment routes require user auth
router.post('/payment/initialize/:orderId', verifyUser, paymentController.initializePayment);
router.get('/payment/verify/:reference', verifyUser, paymentController.verifyPayment);
router.get('/payment/status/:orderId', verifyUser, paymentController.getPaymentStatus);
router.get('/payment/history', verifyUser, paymentController.getPaymentHistory);
router.patch('/payment/cancel/:orderId', verifyUser, paymentController.cancelPayment);

module.exports = router;