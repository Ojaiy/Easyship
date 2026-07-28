const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/paymentSchema');
const Order = require('../models/orderSchema');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://easyship-ng.vercel.app';

// ─── Generate unique transaction reference ────────────────────────────────────
const generateReference = (orderId) => {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `ESN-${orderId.toString().slice(-6)}-${timestamp}-${random}`.toUpperCase();
};

// ─── Initialize Payment ───────────────────────────────────────────────────────
exports.initializePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Confirm this order belongs to this customer
        if (order.customerId.toString() !== customerId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Only allow payment initialization on pending_payment orders
        if (order.orderStatus !== 'pending_payment') {
            return res.status(400).json({
                success: false,
                message: `Order cannot be paid — current status is ${order.orderStatus}`
            });
        }

        // Check for an existing pending payment for this order
        // Prevents duplicate initialization
        const existingPayment = await Payment.findOne({
            orderId,
            status: 'pending'
        });

        if (existingPayment) {
            // Return the existing authorization URL instead of creating another
            return res.status(200).json({
                success: true,
                authorizationUrl: existingPayment.authorizationUrl,
                reference: existingPayment.reference,
                amount: existingPayment.amountNaira
            });
        }

        const amountKobo = Math.round(order.price * 100);
        const reference = generateReference(orderId);
        const user = req.user;

        // Call Paystack to initialize transaction
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: user.email,
                amount: amountKobo,
                reference,
                callback_url: `${FRONTEND_URL}/User/index.html#payment-callback`,
                metadata: {
                    orderId: orderId.toString(),
                    customerId: customerId.toString(),
                    custom_fields: [
                        {
                            display_name: 'Order ID',
                            variable_name: 'order_id',
                            value: orderId.toString()
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const { authorization_url, access_code } = paystackResponse.data.data;

        // Save payment record
        await Payment.create({
            orderId,
            customerId,
            reference,
            authorizationUrl: authorization_url,
            amountKobo,
            amountNaira: order.price,
            status: 'pending'
        });

        return res.status(200).json({
            success: true,
            authorizationUrl: authorization_url,
            reference,
            amount: order.price
        });

    } catch (error) {
        console.error('Payment initialization error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to initialize payment. Please try again.'
        });
    }
};

// ─── Verify Payment (called after Paystack redirects back) ───────────────────
exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        const payment = await Payment.findOne({ reference });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Prevent replay attacks — don't re-verify already successful payments
        if (payment.status === 'successful') {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                paymentStatus: 'successful',
                orderId: payment.orderId
            });
        }

        // Verify with Paystack server-side
        const paystackResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`
                }
            }
        );

        const transaction = paystackResponse.data.data;

        if (
            transaction.status === 'success' &&
            transaction.amount === payment.amountKobo &&
            transaction.currency === 'NGN'
        ) {
            // Payment verified — update payment record
            payment.status = 'successful';
            payment.paystackResponse = transaction;
            payment.paystackTransactionId = transaction.id.toString();
            payment.channel = transaction.channel;
            payment.paidAt = new Date(transaction.paid_at);
            await payment.save();

            // Update order status — now visible to riders
            const order = await Order.findById(payment.orderId);
            if (order) {
                order.paymentStatus = 'paid';
                order.orderStatus = 'waiting_for_rider';
                order.timeline.push({
                    status: 'waiting_for_rider',
                    message: 'Payment confirmed. Looking for an available rider.',
                    updatedBy: 'system'
                });
                await order.save();

                // Notify riders via Socket.IO that a new paid order is available
                if (req.io) {
                    req.io.emit('new_order', {
                        orderId: order._id,
                        pickup: order.pickup,
                        dropoff: order.dropoff,
                        package: order.package,
                        price: order.price
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Payment successful',
                paymentStatus: 'successful',
                orderId: payment.orderId,
                transactionId: payment.paystackTransactionId,
                amount: payment.amountNaira,
                paidAt: payment.paidAt
            });

        } else {
            // Payment failed or amount mismatch
            payment.status = 'failed';
            payment.failureReason = transaction.gateway_response || 'Payment not successful';
            payment.paystackResponse = transaction;
            await payment.save();

            return res.status(200).json({
                success: false,
                message: payment.failureReason,
                paymentStatus: 'failed',
                orderId: payment.orderId
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Payment verification failed. Please contact support.'
        });
    }
};

// ─── Paystack Webhook ─────────────────────────────────────────────────────────
exports.paystackWebhook = async (req, res) => {
    try {
        // Verify webhook signature
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        // Acknowledge immediately — Paystack expects a fast 200
        res.status(200).json({ received: true });

        const { event, data } = req.body;

        if (event === 'charge.success') {
            const payment = await Payment.findOne({ reference: data.reference });

            if (!payment || payment.status === 'successful') return;

            payment.status = 'successful';
            payment.paystackResponse = data;
            payment.paystackTransactionId = data.id.toString();
            payment.channel = data.channel;
            payment.paidAt = new Date(data.paid_at);
            await payment.save();

            const order = await Order.findById(payment.orderId);
            if (order && order.orderStatus === 'pending_payment') {
                order.paymentStatus = 'paid';
                order.orderStatus = 'waiting_for_rider';
                order.timeline.push({
                    status: 'waiting_for_rider',
                    message: 'Payment confirmed via webhook. Looking for an available rider.',
                    updatedBy: 'system'
                });
                await order.save();

                if (req.io) {
                    req.io.emit('new_order', {
                        orderId: order._id,
                        pickup: order.pickup,
                        dropoff: order.dropoff,
                        package: order.package,
                        price: order.price
                    });
                }
            }
        }

    } catch (error) {
        console.error('Webhook error:', error.message);
    }
};

// ─── Get Payment Status ───────────────────────────────────────────────────────
exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'No payment found for this order'
            });
        }

        return res.status(200).json({
            success: true,
            paymentStatus: payment.status,
            reference: payment.reference,
            amount: payment.amountNaira,
            paidAt: payment.paidAt,
            channel: payment.channel
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ─── Get Payment History ──────────────────────────────────────────────────────
exports.getPaymentHistory = async (req, res) => {
    try {
        const customerId = req.user._id;

        const payments = await Payment.find({ customerId })
            .populate('orderId', 'pickup dropoff orderStatus price distance')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ─── Cancel Payment (before completion) ──────────────────────────────────────
exports.cancelPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user._id;

        const payment = await Payment.findOne({
            orderId,
            customerId,
            status: 'pending'
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'No pending payment found for this order'
            });
        }

        payment.status = 'cancelled';
        await payment.save();

        return res.status(200).json({
            success: true,
            message: 'Payment cancelled'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};