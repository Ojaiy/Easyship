const jwt = require('jsonwebtoken');

const User =
require('../models/userSchema');

const adminAuth =
async (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({
                success: false,
                message: 'Access denied'
            });

        }

        const token =
            authHeader.split(' ')[1];

        const decoded =
            jwt.verify(
                token,
                process.env.TOKEN_SECRET
            );

        const user =
            await User.findById(
                decoded.userId
            );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User not found'
            });

        }

        if (user.role !== 'admin') {

            return res.status(403).json({
                success: false,
                message: 'Admin access only'
            });

        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = adminAuth;