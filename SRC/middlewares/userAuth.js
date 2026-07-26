const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Authentication token is required."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
};

module.exports = verifyUser;