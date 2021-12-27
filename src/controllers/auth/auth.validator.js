const Joi = require('joi');

export const register = {
    body: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().allow('').optional().email(),
        password: Joi.string().required(),
        age: Joi.number().required(),
        gender: Joi.string().required(),
        city: Joi.string().required(),
        role: Joi.string().required().valid('user', 'admin', 'caretaker', 'doctor'),
        caretaker_code: Joi.string().when("role", {
            is: "caretaker",
            then: Joi.required()
        }),
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
            .email()
            .required(),
        password: Joi.string().required(),
        role: ""
    },
};
