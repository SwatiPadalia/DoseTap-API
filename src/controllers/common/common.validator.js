const Joi = require('joi');

export const sendOTP = {
    body: {
        phone: Joi.string().max(10).required()
            .options({
                language: {
                    key: '{{key}} ',
                    any: { required: `is required` },
                    string: { max: `must be at least 10 digits` },
                }
            }),
    }
}

export const verifyOTP = {
    body: {
        phone: Joi.string().max(10).required()
            .options({
                language: {
                    key: '{{key}} ',
                    any: { required: `is required` },
                    string: { max: `must be at least 10 digits` },
                }
            }),
        hash: Joi.string().required(),
        otp: Joi.string().max(6).required()
    }
}