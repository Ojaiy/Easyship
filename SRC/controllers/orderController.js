const Order = require('../models/orderSchema');
const { calculateDistance } = require("../services/distanceService");
const { calculateDeliveryPrice } = require("../services/pricingService");


const addTimelineEvent = (order, status, message, updatedBy) => {
    order.timeline.push({
        status,
        message,
        updatedBy,
        createdAt: new Date()
    });
};


const createOrder = async (req, res) => {
    try {

        const {
            pickup,
            dropoff,
            package: packageDetails,
            instructions
        } = req.body;

        // Validate addresses
        if (!pickup?.address || !dropoff?.address) {
            return res.status(400).json({
                success: false,
                message: "Pickup and drop-off addresses are required."
            });
        }

        // Calculate road distance
        const distance = await calculateDistance(
            pickup.address,
            dropoff.address
        );

        // Calculate delivery price
        const { price } = calculateDeliveryPrice(distance);

        // Create order instance
        const order = new Order({

            customerId: req.user._id,

            pickup,

            dropoff,

            package: packageDetails,

            instructions: instructions || "",

            distance,

            price,

            paymentStatus: "pending",

            orderStatus: "pending_payment",

            assignedRider: null,

            timeline: []

        });

        // Add initial timeline event
        addTimelineEvent(
            order,
            "pending_payment",
            "Order created successfully. Awaiting payment.",
            "customer"
        );

        // Save once
        await order.save();

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            orderId: order._id,
            distance: order.distance,
            price: order.price,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

// GET ALL CUSTOMER ORDERS
const getUserOrders = async (req, res) => {
    try {

        const orders = await Order.find({
            customerId: req.user._id,
            isArchived: false
        })
        .populate("assignedRider", "name phone")
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

// GET SINGLE ORDER
const getOrderById = async (req, res) => {
    try {

        const order = await Order.findById(req.params.orderId)
            .populate("customerId", "name email phone")
            .populate("assignedRider", "name email phone");

        if (!order) {

            return res.status(404).json({
                success: false,
                message: "Order not found."
            });

        }

        const isOwner =
            order.customerId._id.toString() === req.user._id.toString();

        if (!isOwner) {

            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this order."
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

// CUSTOMER DASHBOARD
const getDashboardStats = async (req, res) => {
    try {

        const customerId = req.user._id;

        const totalOrders = await Order.countDocuments({
            customerId,
            isArchived: false
        });

        const awaitingPayment = await Order.countDocuments({
            customerId,
            orderStatus: "pending_payment",
            isArchived: false
        });

        const activeOrders = await Order.countDocuments({
            customerId,
            orderStatus: {
                $in: [
                    "waiting_for_rider",
                    "accepted",
                    "heading_to_pickup",
                    "picked_up",
                    "in_transit"
                ]
            },
            isArchived: false
        });

        const deliveredOrders = await Order.countDocuments({
            customerId,
            orderStatus: "completed",
            isArchived: false
        });

        const cancelledOrders = await Order.countDocuments({
            customerId,
            orderStatus: "cancelled",
            isArchived: false
        });

        const recentOrders = await Order.find({
            customerId,
            isArchived: false
        })
        .populate("assignedRider", "name phone")
        .sort({ createdAt: -1 })
        .limit(5);

        return res.status(200).json({
            success: true,

            stats: {

                totalOrders,

                awaitingPayment,

                activeOrders,

                deliveredOrders,

                cancelledOrders

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

// GET all available orders
const getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            orderStatus: 'waiting_for_rider',  // was 'pending'
            paymentStatus: 'paid'              // only paid orders
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
// RIDER DASHBOARD
const getRiderStats = async (req, res) => {
    try {

        const riderId = req.rider._id;

        const activeOrders = await Order.countDocuments({
            assignedRider: riderId,
            orderStatus: {
                $in: [
                    "accepted",
                    "heading_to_pickup",
                    "picked_up",
                    "in_transit"
                ]
            }
        });

        const completedOrders = await Order.countDocuments({
            assignedRider: riderId,
            orderStatus: "completed"
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayDeliveries = await Order.countDocuments({
            assignedRider: riderId,
            orderStatus: "completed",
            updatedAt: {
                $gte: today
            }
        });

        return res.status(200).json({
            success: true,
            stats: {
                activeOrders,
                completedOrders,
                todayDeliveries
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ACCEPT ORDER
const acceptOrder = async (req, res) => {
    try {

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (order.assignedRider) {
            return res.status(400).json({
                success: false,
                message: "Order has already been accepted."
            });
        }

        order.assignedRider = req.rider._id;
        order.orderStatus = "accepted";

        addTimelineEvent(
            order,
            "accepted",
            "Rider accepted the order.",
            "rider"
        );

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order accepted successfully.",
            order
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// MARK PICKED UP
const markPickedUp = async (req, res) => {
    try {

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            !order.assignedRider ||
            order.assignedRider.toString() !== req.rider._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        order.orderStatus = "picked_up";

        addTimelineEvent(
            order,
            "picked_up",
            "Package picked up successfully.",
            "rider"
        );

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Package marked as picked up.",
            order
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// MARK DELIVERED
const markDelivered = async (req, res) => {
    try {

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            !order.assignedRider ||
            order.assignedRider.toString() !== req.rider._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        order.orderStatus = "completed";

        addTimelineEvent(
            order,
            "completed",
            "Package delivered successfully.",
            "rider"
        );

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order delivered successfully.",
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