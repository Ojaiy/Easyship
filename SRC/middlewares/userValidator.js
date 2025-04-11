const joi = require('joi');

exports.userSignupSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email({tlds: {allow: ['com', 'org', 'net']}, }).required(),
    password: joi.string().min(8).required().pattern(new RegExp('^.*$')),
    phone: joi.string().required(),
    address: joi.string().required(),
})

exports.userSigninSchema = joi.object({
    email: joi.string().email({tlds: {allow: ['com', 'org', 'net']}, }).optional(),
    phone: joi.string().optional(),
    password: joi.string().required().pattern(new RegExp('^.*$')),
})