const Tracking = require("../models/trackingSchema");

exports.startTracking = async (req, res) => {
  try {
    const { orderId, currentLocation } = req.body;
    const tracking = new Tracking({ orderId, currentLocation, status: "picked up" });
    await tracking.save();
    res.status(201).json({ message: "Tracking started", tracking });
  } catch (error) {
    res.status(500).json({ error: "Failed to start tracking", details: error.message});
  }
};

exports.updateTracking = async (req, res) => {
  try {
    const { orderId, currentLocation, status } = req.body;
    const tracking = await Tracking.findOneAndUpdate(
      { orderId },
      { currentLocation, status },
      { new: true }
    );

    if (!tracking) return res.status(404).json({ error: "Tracking record not found" });

    res.json({ message: "Location updated", tracking });
  } catch (error) {
    res.status(500).json({ error: "Failed to update location" });
  }
};

exports.getTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findOne({ orderId: req.params.orderId });
    if (!tracking) return res.status(404).json({ error: "Tracking not found" });

    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tracking data" });
  }
};
