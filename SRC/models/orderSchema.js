const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedRider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rider",
            default: null
        },

        pickup: {
            address: {
                type: String,
                required: true,
                trim: true
            }
        },

        dropoff: {
            address: {
                type: String,
                required: true,
                trim: true
            },
            recipientName: {
                type: String,
                required: true,
                trim: true
            },
            phone: {
                type: String,
                required: true,
                trim: true
            }
        },

        package: {
            type: {
                type: String,
                enum: ["document", "small", "medium", "large", "freight"],
                required: true
            },
            weight: {
                type: Number,
                required: true,
                min: 0.1
            }
        },

        instructions: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            default: 0
        },

        distance: {
            type: Number,
            default: 0
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "pending_payment",
                "waiting_for_rider",
                "accepted",
                "heading_to_pickup",
                "picked_up",
                "in_transit",
                "delivered",
                "completed",
                "cancelled"
            ],
            default: "pending_payment"
        },

        acceptedAt: {
            type: Date,
            default: null
        },

        pickedUpAt: {
            type: Date,
            default: null
        },

        deliveredAt: {
            type: Date,
            default: null
        },

        confirmedAt: {
            type: Date,
            default: null
        },

        cancelledAt: {
            type: Date,
            default: null
        },

        cancelledBy: {
            type: String,
            enum: ["customer", "rider", "admin"],
            default: null
        },

        cancellationReason: {
            type: String,
            default: ""
        },

        customerConfirmed: {
            type: Boolean,
            default: false
        },

        isArchived: {
            type: Boolean,
            default: false
        },

        timeline: [
            {
                status: {
                    type: String,
                    required: true
                },

                message: {
                    type: String,
                    required: true
                },

                updatedBy: {
                    type: String,
                    enum: ["customer", "rider", "admin", "system"],
                    required: true
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);