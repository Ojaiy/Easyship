const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
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

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        role: {
            type: String,
            enum: ['customer', 'rider', 'admin'],
            default: 'customer'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);