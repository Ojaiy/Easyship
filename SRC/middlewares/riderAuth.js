const jwt = require('jsonwebtoken');
const Rider = require('../models/riderSchema');

const verifyRider = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        const rider = await Rider.findById(decoded.userId);

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: "Rider not found"
            });
        }

        req.rider = rider;

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

const requireApprovedRider = (req, res, next) => {
    const rider = req.rider;

    if (!rider) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    if (rider.status !== "approved") {
        return res.status(403).json({
            success: false,
            message: `Access denied: rider status is ${rider.status}`
        });
    }

    next();
};

const blockSuspendedRider = (req, res, next) => {
    const rider = req.rider;

    if (!rider) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access"
        });
    }

    if (rider.status === "suspended") {
        return res.status(403).json({
            success: false,
            message: "Account suspended. Contact support."
        });
    }

    next();
};

module.exports = {
    verifyRider,
    requireApprovedRider,
    blockSuspendedRider
};