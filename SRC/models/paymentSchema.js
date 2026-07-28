const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            index: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Paystack transaction reference — unique per attempt
        reference: {
            type: String,
            required: true,
            unique: true
        },

        // Paystack authorization URL for redirect
        authorizationUrl: {
            type: String,
            default: ''
        },

        // Amount in kobo (Paystack uses kobo)
        amountKobo: {
            type: Number,
            required: true
        },

        // Amount in naira for display
        amountNaira: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ['pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'],
            default: 'pending'
        },

        // Raw Paystack verification response
        paystackResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        // Paystack transaction ID after verification
        paystackTransactionId: {
            type: String,
            default: null
        },

        // Channel used: card, bank_transfer, ussd, etc.
        channel: {
            type: String,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        },

        failureReason: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);