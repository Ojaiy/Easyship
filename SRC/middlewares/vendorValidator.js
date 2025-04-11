const joi = require('joi');

const allowedPaymentMethods= ['Bank Transfer', 'Bank Card', 'Cash'];

exports.vendorSignupSchema = joi.object({
    businessName: joi.string().required(),
    businessType:joi.string().required(),
    businessAddress:joi.string().required(),
    bankAccountname: joi.string().required(),
    bankAccountnumber: joi.number().required(),
    bankName: joi.string().required(),
    paymentMethodPreferences: joi.alternatives().try(
        joi.string().valid(...allowedPaymentMethods),
        joi.array().items(joi.string().valid(...allowedPaymentMethods))).required(),
      businessRegCert: joi.any().required().label('Business Registration Certificate'),
      validID: joi.any().required().label('Valid ID'),
    
      termsandConditionsAgreement: joi.string().valid('agree').required()
})
