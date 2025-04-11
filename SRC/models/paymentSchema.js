const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    paymentMethod: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
});

module.exports = mongoose.model('Payment', paymentSchema);