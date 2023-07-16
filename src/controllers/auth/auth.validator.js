const Joi = require('joi');

export const register = {
    body: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().allow('').optional().email(),
        password: Joi.string().required(),
        dob: Joi.date().iso().required(),
        gender: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        role: Joi.string().required().valid('user', 'admin', 'caretaker', 'doctor'),
        reference_code: Joi.string().when("role", {
            is: "caretaker",
            then: Joi.required()
        }).concat(Joi.string().when("role", {
            is: "user",
            then: Joi.required()
        })),
        phone: Joi.string().max(10).required()
            .options({
                language: {
                    key: '{{key}} ',
                    any: { required: `is required` },
                    string: { max: `must be at least 10 digits` },
                }
            }),
    },
};

export const login = {
    body: {
        email: Joi.string()
            .email().when('phone', { is: null, then: Joi.required() }),
        phone: Joi.number().default(null),
        password: Joi.string().required(),
        role: "",
        fcmToken: Joi.string().optional(),
    },
};

export const forgotPassword = {
    body: {
        email: Joi.string()
            .email()
            .required(),
    },
};

export const resetPassword = {
    body: {
        password: Joi.string()
            .required(),
    },
};
