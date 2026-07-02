const Joi = require('joi');

const riderSignupSchema = Joi.object({

    // Personal Information
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

    email: Joi.string()
        .email()
        .lowercase()
        .required(),

    phone: Joi.string()
        .trim()
        .min(10)
        .max(15)
        .required(),

    password: Joi.string()
        .min(8)
        .required(),

    dateOfBirth: Joi.date()
        .required(),

    address: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .required(),

    // Vehicle Information
    vehicleType: Joi.string()
        .valid('Motorcycle', 'Car', 'Van', 'Truck')
        .required(),

    vehicleBrand: Joi.string()
        .trim()
        .required(),

    vehicleModel: Joi.string()
        .trim()
        .required(),

    vehicleColor: Joi.string()
        .trim()
        .required(),

    plateNumber: Joi.string()
        .trim()
        .uppercase()
        .required()

});

const riderSigninSchema = Joi.object({

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .required()

});

module.exports = {
    riderSignupSchema, riderSigninSchema
};