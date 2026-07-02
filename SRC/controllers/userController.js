const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const Rider = require('../models/riderSchema');

const {
    userSignupSchema,
    userSigninSchema
} = require('../middlewares/userValidator');

const {
    hashUser,
    doHashValidation
} = require('../utils/userHashing');

exports.userSignup = async (req, res) => {
    const {
        email,
        password,
        name,
        phone
    } = req.body;

    try {

        const { error } = userSignupSchema.validate({
            email,
            password,
            name,
            phone
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const existingRider = await Rider.findOne({ email });
        if (existingRider) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered as a rider'
            });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message: 'Phone number already exists'
            });
        }

        const hashedPassword = await hashUser(password, 12);

        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        });

        const token = jwt.sign(
            {
                userId: newUser._id,
                email: newUser.email
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            success: true,
            message: 'Your EASYSHIP NG account has been created successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.userSignin = async (req, res) => {

    const { email, phone, password } = req.body;

    try {

        const { error } = userSigninSchema.validate({
            email,
            phone,
            password
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        let existingUser = null;
        let isRider = false;

        if (email) {
            existingUser = await User.findOne({ email });
        } else if (phone) {
            existingUser = await User.findOne({ phone });
        }

        if (!existingUser) {
            if (email) {
                existingUser = await Rider.findOne({ email });
            } else if (phone) {
                existingUser = await Rider.findOne({ phone });
            }
            if (existingUser) isRider = true;
        }

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await doHashValidation(
            password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        const role = isRider ? 'rider' : existingUser.role;

        const token = jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
                role
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        let redirectPage = '/User/index.html';

        if (role === 'admin') {
            redirectPage = '/Admin/admin.html';
        } else if (isRider) {
            switch (existingUser.status) {
                case 'approved':
                    redirectPage = '/Rider/rider-dashboard.html';
                    break;
                case 'rejected':
                    redirectPage = '/Rider/rider-rejected.html';
                    break;
                case 'suspended':
                    redirectPage = '/Rider/rider-suspended.html';
                    break;
                default:
                    redirectPage = '/Rider/rider-pending.html';
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            redirectPage,
            user: {
                id: existingUser._id,
                name: existingUser.name || `${existingUser.firstName} ${existingUser.lastName}`,
                email: existingUser.email,
                phone: existingUser.phone,
                role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.userSignout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(
            req.params.userId
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};