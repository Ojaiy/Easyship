const Order = require('../models/orderSchema');

const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);

        // Notify all connected riders that a new order is available
        req.io.emit('new_order', {
            orderId: order._id,
            pickup: order.pickup,
            dropoff: order.dropoff,
            package: order.package,
            price: order.price
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            customerId: req.params.customerId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        const totalOrders = await Order.countDocuments({ customerId });
        const pendingOrders = await Order.countDocuments({ customerId, status: 'pending' });
        const inTransitOrders = await Order.countDocuments({ customerId, status: 'in_transit' });
        const deliveredOrders = await Order.countDocuments({ customerId, status: 'delivered' });

        const recentOrders = await Order.find({ customerId })
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                inTransitOrders,
                deliveredOrders
            },
            recentOrders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================================
// RIDER ORDER ACTIONS
// ============================================================

// GET all pending orders available for riders to accept
const getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET rider's own stats for the dashboard
const getRiderStats = async (req, res) => {
    try {
        const riderId = req.rider._id;

        const totalDeliveries = await Order.countDocuments({
            riderId,
            status: 'delivered'
        });

        const activeOrders = await Order.countDocuments({
            riderId,
            status: { $in: ['dispatch_assigned', 'pickup_in_progress', 'in_transit'] }
        });

        const completedOrders = await Order.countDocuments({
            riderId,
            status: 'delivered'
        });

        // Current active delivery if any
        const activeDelivery = await Order.findOne({
            riderId,
            status: { $in: ['dispatch_assigned', 'pickup_in_progress', 'in_transit'] }
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalDeliveries,
                activeOrders,
                completedOrders
            },
            activeDelivery: activeDelivery || null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PATCH — rider accepts an order
const acceptOrder = async (req, res) => {
    try {
        const riderId = req.rider._id;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Order is no longer available'
            });
        }

        order.riderId = riderId;
        order.status = 'dispatch_assigned';
        await order.save();

        // Notify the customer their order was accepted
        req.io.to(order.customerId.toString()).emit('order_update', {
            orderId: order._id,
            status: 'dispatch_assigned',
            message: 'A rider has accepted your order and is on the way'
        });

        return res.status(200).json({
            success: true,
            message: 'Order accepted successfully',
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PATCH — rider marks order as picked up
const markPickedUp = async (req, res) => {
    try {
        const riderId = req.rider._id;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.riderId.toString() !== riderId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this order'
            });
        }

        if (order.status !== 'dispatch_assigned') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be marked as picked up at this stage'
            });
        }

        order.status = 'pickup_in_progress';
        await order.save();

        req.io.to(order.customerId.toString()).emit('order_update', {
            orderId: order._id,
            status: 'pickup_in_progress',
            message: 'Your package has been picked up and is on the way'
        });

        return res.status(200).json({
            success: true,
            message: 'Order marked as picked up',
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PATCH — rider marks order as delivered
const markDelivered = async (req, res) => {
    try {
        const riderId = req.rider._id;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.riderId.toString() !== riderId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this order'
            });
        }

        if (order.status !== 'pickup_in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be marked as delivered at this stage'
            });
        }

        order.status = 'delivered';
        await order.save();

        req.io.to(order.customerId.toString()).emit('order_update', {
            orderId: order._id,
            status: 'delivered',
            message: 'Your package has been delivered successfully'
        });

        return res.status(200).json({
            success: true,
            message: 'Order marked as delivered',
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    getDashboardStats,
    getAvailableOrders,
    getRiderStats,
    acceptOrder,
    markPickedUp,
    markDelivered
};