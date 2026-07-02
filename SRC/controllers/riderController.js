const cloudinary = require('../utils/cloudinary');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const Rider = require('../models/riderSchema');

const {
    riderSignupSchema,
    riderSigninSchema
} = require('../middlewares/riderValidator');

const {
    hashRider
} = require('../utils/riderHashing');

const uploadToCloudinary =
    require('../utils/uploadToCloudinary');


exports.riderSignup = async (req, res) => {

    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        dateOfBirth,
        address,
        vehicleType,
        vehicleBrand,
        vehicleModel,
        vehicleColor,
        plateNumber
    } = req.body;

    try {

        const { error } =
            riderSignupSchema.validate({
                firstName,
                lastName,
                email,
                phone,
                password,
                dateOfBirth,
                address,
                vehicleType,
                vehicleBrand,
                vehicleModel,
                vehicleColor,
                plateNumber
            });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const existingRider = await Rider.findOne({ email });
        if (existingRider) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered as a customer'
            });
        }

        const existingPhone = await Rider.findOne({ phone });
        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message: 'Phone number already exists'
            });
        }

        const existingPlate = await Rider.findOne({ plateNumber });
        if (existingPlate) {
            return res.status(409).json({
                success: false,
                message: 'Plate number already exists'
            });
        }

        if (
            !req.files?.profilePhoto ||
            !req.files?.driversLicense ||
            !req.files?.governmentId ||
            !req.files?.vehicleRegistration ||
            !req.files?.vehiclePhoto
        ) {
            return res.status(400).json({
                success: false,
                message: 'All required documents must be uploaded'
            });
        }

        const profilePhoto = await uploadToCloudinary(
            req.files.profilePhoto[0].buffer,
            'easyship/riders/profile-photos'
        );

        const driversLicense = await uploadToCloudinary(
            req.files.driversLicense[0].buffer,
            'easyship/riders/drivers-licenses'
        );

        const governmentId = await uploadToCloudinary(
            req.files.governmentId[0].buffer,
            'easyship/riders/government-ids'
        );

        const vehicleRegistration = await uploadToCloudinary(
            req.files.vehicleRegistration[0].buffer,
            'easyship/riders/vehicle-registrations'
        );

        const vehiclePhoto = await uploadToCloudinary(
            req.files.vehiclePhoto[0].buffer,
            'easyship/riders/vehicle-photos'
        );

        const hashedPassword = await hashRider(password, 12);

        const newRider = await Rider.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            dateOfBirth,
            address,
            vehicleType,
            vehicleBrand,
            vehicleModel,
            vehicleColor,
            plateNumber,
            profilePhoto,
            driversLicense,
            governmentId,
            vehicleRegistration,
            vehiclePhoto
        });

        // userId key matches what verifyRider expects (decoded.userId)
        const token = jwt.sign(
            {
                userId: newRider._id,
                email: newRider.email,
                role: 'rider'
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            success: true,
            message: 'Registration submitted successfully. Awaiting admin approval.',
            token,
            rider: {
                id: newRider._id,
                firstName: newRider.firstName,
                lastName: newRider.lastName,
                email: newRider.email,
                phone: newRider.phone,
                status: newRider.status,
                role: 'rider'
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.riderSignin = async (req, res) => {
    try {
        const { error } = riderSigninSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        const rider = await Rider.findOne({ email });

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: 'Rider not found'
            });
        }

        const isMatch = await bcrypt.compare(password, rider.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // ✅ NEW: Block unapproved riders at login
        if (rider.status !== 'approved') {
            let message = 'Your account is pending approval. Please wait for admin confirmation.';
            if (rider.status === 'rejected') {
                message = 'Your account has been rejected. Contact support for more information.';
            } else if (rider.status === 'suspended') {
                message = 'Your account has been suspended. Contact support.';
            }
            return res.status(403).json({
                success: false,
                message: message,
                status: rider.status
            });
        }

        // userId key matches what verifyRider expects (decoded.userId)
        const token = jwt.sign(
            {
                userId: rider._id,
                email: rider.email,
                role: 'rider'
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        let redirectPage = '/Rider/rider-pending.html';

        switch (rider.status) {
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

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            rider: {
                id: rider._id,
                firstName: rider.firstName,
                lastName: rider.lastName,
                email: rider.email,
                status: rider.status,
                role: 'rider'
            },
            redirectPage
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getRiderStatus = async (req, res) => {
    try {
        const rider = req.rider;

        let redirectPage = '/Rider/rider-pending.html';

        switch (rider.status) {
            case 'approved':
                redirectPage = '/Rider/rider-dashboard.html';
                break;
            case 'rejected':
                redirectPage = '/Rider/rider-rejected.html';
                break;
            case 'suspended':
                redirectPage = '/Rider/rider-suspended.html';
                break;
        }

        return res.status(200).json({
            success: true,
            status: rider.status,
            redirectPage
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.riderSignout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'Rider signed out successfully'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};