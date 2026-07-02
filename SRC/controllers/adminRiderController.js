const Rider = require("../models/riderSchema");


// =============================
// GET ALL PENDING RIDERS
// =============================
exports.getPendingRiders = async (req, res) => {
    try {
        const riders = await Rider.find({ status: "pending" });

        return res.status(200).json({
            success: true,
            riders
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =============================
// APPROVE RIDER
// =============================
exports.approveRider = async (req, res) => {
    try {
        const rider = await Rider.findById(req.params.id);

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: "Rider not found"
            });
        }

        rider.status = "approved";
        await rider.save();

        return res.status(200).json({
            success: true,
            message: "Rider approved successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =============================
// REJECT RIDER
// =============================
exports.rejectRider = async (req, res) => {
    try {
        const rider = await Rider.findById(req.params.id);

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: "Rider not found"
            });
        }

        rider.status = "rejected";
        await rider.save();

        return res.status(200).json({
            success: true,
            message: "Rider rejected successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};