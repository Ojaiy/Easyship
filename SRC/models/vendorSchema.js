const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    businessName: {type: String,
        required: true},
   businessType: {type: String,
        required: true,
        enum: ['restaurant, boutique']
    },
    businessAddress: {type: String,
        required: true},
    bankAccountname: {type: String,
        required: true},
    bankAccountnumber: {type: Number,
            required: true},
    bankName: {type: String,
        required: true},
    paymentMethodPreferences: {type: String,
        required: true},
        businessRegCert: {
            type: {
              fileName: String,
              filePath: String,
              fileType: String,
              uploadedAt: {
                type: Date,
                default: Date.now
              }
            },
            required: true
          },
          validID: {
            type: {
              fileName: String,
              filePath: String,
              fileType: String,
              uploadedAt: {
                type: Date,
                default: Date.now
              }
            },
            required: true
          },
    businessLogo: {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now
            }
    },
    productCatalog: {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now
            }
    },
    avOrderProcessingTime:{
        type: String,
        enum: ['15 mins', '30 mins', '45 mins', '1 hour', 'more than 1 hour'],
        default: undefined 
    },
    deliveryMEthodOptions: {
        type: String,
        enum: ['self-pickup', 'delivery', 'both'],
        default: undefined
    },
    termsandConditionsAgreement: {
        type: Boolean,
        enum: ['agree', 'disagree'],
        required: true
    },
    marketingConsent: {
        type: Boolean,
        enum: ['true', 'false'],
        default: false
    }
        
   })

module.exports = mongoose.model('Vendor', vendorSchema)