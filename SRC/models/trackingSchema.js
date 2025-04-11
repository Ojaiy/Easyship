const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  currentLocation: String,
  status: { type: String, enum: ["picked up", "in transit", "delivered"], default: "picked up" },
}, { timestamps: true });

module.exports = mongoose.model("Tracking", trackingSchema);