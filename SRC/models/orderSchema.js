const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
{
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  pickup: {
    address: {
      type: String,
      required: true
    },

    contactName: {
      type: String,
      required: true
    },
  },

  dropoff: {
    address: {
      type: String,
      required: true
    },

    recipientName: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    }
  },

  package: {
    description: String,

    weight: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number,
      default: 1
    }
  },

  status: {
    type: String,
    default: 'Pending'
  }

},
{
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);