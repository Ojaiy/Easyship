const User = require('../models/userSchema');
const Order = require('../models/orderSchema');
const Rider = require('../models/riderSchema')

const {
    registerRiderSchema,
    cancelOrderSchema
} = require('../middlewares/adminValidator');

const {
    hashUser
} = require('../utils/userHashing');

const {
    createNotification
} = require('../utils/notificationHelper');

exports.getDashboardStats = async (req, res) => {

    try {

        const totalCustomers =
            await User.countDocuments({
                role: 'customer'
            });

       const totalRiders =
    await Rider.countDocuments();

        const totalOrders =
            await Order.countDocuments();

        const pendingOrders =
            await Order.countDocuments({
                status: 'pending'
            });

        const deliveredOrders =
            await Order.countDocuments({
                status: 'delivered'
            });

        const cancelledOrders =
            await Order.countDocuments({
                status: 'cancelled'
            });

        return res.status(200).json({
            success: true,
            stats: {
                totalCustomers,
                totalRiders,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.registerRider = async (req, res) => {

    const {
        name,
        email,
        password,
        phone
    } = req.body;

    try {

        const { error } =
            registerRiderSchema.validate({
                name,
                email,
                password,
                phone
            });

        if (error) {

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });

        }

        const existingUser =
            await User.findOne({
                $or: [
                    { email },
                    { phone }
                ]
            });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });

        }

        const hashedPassword =
            await hashUser(password, 12);

        const rider =
            await User.create({
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'rider'
            });

        return res.status(201).json({
            success: true,
            message: 'Rider registered successfully',
            rider
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getAllRiders = async (req, res) => {

    try {

        const riders =
            await User.find({
                role: 'rider'
            }).select('-password');

        return res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.deleteRider = async (req, res) => {

    try {

        const rider =
            await User.findOneAndDelete({
                _id: req.params.riderId,
                role: 'rider'
            });

        if (!rider) {

            return res.status(404).json({
                success: false,
                message: 'Rider not found'
            });

        }

        return res.status(200).json({
            success: true,
            message: 'Rider deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getPendingRiders = async (req, res) => {

    try {

        const riders =
            await Rider.find({
                status: 'pending'
            }).select('-password');

        return res.status(200).json({
            success: true,
            riders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getApprovedRiders = async (req, res) => {

    try {

        const riders =
            await Rider.find({
                status: 'approved'
            }).select('-password');

        return res.status(200).json({
            success: true,
            riders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


exports.getRejectedRiders = async (req, res) => {

    try {

        const riders =
            await Rider.find({
                status: 'rejected'
            }).select('-password');

        return res.status(200).json({
            success: true,
            riders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.approveRider = async (req, res) => {

    try {

        const rider =
            await Rider.findById(
                req.params.riderId
            );

        if (!rider) {

            return res.status(404).json({
                success: false,
                message: 'Rider not found'
            });

        }

        rider.status = 'approved';

await rider.save();

await User.create({

    name:
        `${rider.firstName} ${rider.lastName}`,

    email:
        rider.email,

    phone:
        rider.phone,

    password:
        rider.password,

    role:
        'rider'

});

        return res.status(200).json({
            success: true,
            message: 'Rider approved successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


exports.rejectRider = async (req, res) => {

    try {

        const rider =
            await Rider.findById(
                req.params.riderId
            );

        if (!rider) {

            return res.status(404).json({
                success: false,
                message: 'Rider not found'
            });

        }

        rider.status = 'rejected';

        await rider.save();

        return res.status(200).json({
            success: true,
            message: 'Rider rejected successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getAllCustomers = async (req, res) => {

    try {

        const customers =
            await User.find({
                role: 'customer'
            }).select('-password');

        return res.status(200).json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.deleteCustomer = async (req, res) => {

    try {

        const customer =
            await User.findOneAndDelete({
                _id: req.params.customerId,
                role: 'customer'
            });

        if (!customer) {

            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });

        }

        return res.status(200).json({
            success: true,
            message: 'Customer deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getAllOrders = async (req, res) => {

    try {

        const orders =
            await Order.find()
                .populate('customerId', 'name email phone')
                .populate('driver', 'name email phone');

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

exports.cancelOrder = async (req, res) => {

    const { reason } = req.body;

    try {

        const { error } =
            cancelOrderSchema.validate({
                reason
            });

        if (error) {

            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });

        }

        const order =
            await Order.findById(
                req.params.orderId
            );

        if (!order) {

            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });

        }

        order.status = 'cancelled';

        await order.save();

        await createNotification(
            order.customerId,
            'Order Cancelled',
            `Your order was cancelled. Reason: ${reason}`,
            'order_cancelled'
        );

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};