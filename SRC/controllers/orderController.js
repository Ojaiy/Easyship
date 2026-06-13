const Order = require('../models/orderSchema');

exports.createOrder = async (req, res) => {

try {

const order = await Order.create(req.body);

res.status(201).json({
success: true,
message: "Order created",
order
});

}

catch (error) {

res.status(500).json({
success: false,
message: error.message
});

}

};