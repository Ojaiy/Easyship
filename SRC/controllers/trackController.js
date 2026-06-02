const Tracking = require("../models/trackingSchema");

// START TRACKING
exports.startTracking = async (req, res) => {
  try {
    const { orderId, currentLocation } = req.body;

    // Validation
    if (!orderId || !currentLocation) {
      return res.status(400).json({
        success: false,
        message: "orderId and currentLocation are required",
      });
    }

    // Prevent duplicate tracking
    const existing = await Tracking.findOne({ orderId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Tracking already exists for this orderId",
      });
    }

    const tracking = new Tracking({
      orderId,
      currentLocation,
      status: "picked up",
    });

    await tracking.save();

    return res.status(201).json({
      success: true,
      message: "Tracking started successfully",
      data: tracking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to start tracking",
      error: error.message,
    });
  }
};

// UPDATE TRACKING
exports.updateTracking = async (req, res) => {
  try {
    const { orderId, currentLocation, status } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    // Build dynamic update object
    const updateData = {};
    if (currentLocation) updateData.currentLocation = currentLocation;
    if (status) updateData.status = status;

    const tracking = await Tracking.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tracking updated successfully",
      data: tracking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update tracking",
      error: error.message,
    });
  }
};

// GET TRACKING
exports.getTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const tracking = await Tracking.findOne({ orderId });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching tracking data",
      error: error.message,
    });
  }
};