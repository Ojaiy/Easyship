const joi = require('joi');

exports.registerRiderSchema = joi.object({
    name: joi.string().required(),

    email: joi
        .string()
        .email({
            tlds: {
                allow: ['com', 'org', 'net']
            }
        })
        .required(),

    password: joi
        .string()
        .min(8)
        .required(),

    phone: joi.string().required()
});

exports.cancelOrderSchema = joi.object({
    reason: joi
        .string()
        .required()
});