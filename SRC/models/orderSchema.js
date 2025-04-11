const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    status: { type: String, enum: ["pending", "accepted", "in transit", "delivered", "cancelled"], default: "pending" },
});

module.exports = mongoose.model('Booking', bookingSchema);