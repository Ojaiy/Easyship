const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({

    // Personal Information
    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    // Vehicle Information
    vehicleType: {
        type: String,
        required: true,
        enum: ['Motorcycle', 'Car', 'Van', 'Truck']
    },

    vehicleBrand: {
        type: String,
        required: true,
        trim: true
    },

    vehicleModel: {
        type: String,
        required: true,
        trim: true
    },

    vehicleColor: {
        type: String,
        required: true,
        trim: true
    },

    plateNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    // Cloudinary Document URLs
    profilePhoto: {
        type: String,
        required: true
    },

    driversLicense: {
        type: String,
        required: true
    },

    governmentId: {
        type: String,
        required: true
    },

    vehicleRegistration: {
        type: String,
        required: true
    },

    vehiclePhoto: {
        type: String,
        required: true
    },

    // Admin Approval
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },

    approvalDate: {
        type: Date,
        default: null
    },

    rejectionReason: {
        type: String,
        default: null
    },

    // Rider Status
    isAvailable: {
        type: Boolean,
        default: true
    },

    // Statistics
    completedDeliveries: {
        type: Number,
        default: 0
    },

    rating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
    },

    // Earnings
    earnings: {
        type: Number,
        default: 0
    },

    todayEarnings: {
        type: Number,
        default: 0
    },

    weeklyEarnings: {
        type: Number,
        default: 0
    },

    monthlyEarnings: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Rider', riderSchema);