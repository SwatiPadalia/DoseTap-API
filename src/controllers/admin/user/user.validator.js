const Joi = require('joi');

export const createUser = {
    body: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().allow('').allow(null).optional().email(),
        password: Joi.string().required(),
        age: Joi.number().required(),
        gender: Joi.string().required(),
        role: Joi.string().required().valid('user', 'admin', 'caretaker', 'doctor'),
        city: Joi.string().required(),
        state: Joi.string().required(),
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


export const editUser = {
    body: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().allow('').allow(null).optional().email(),
        password: Joi.string().optional(),
        age: Joi.number().required(),
        gender: Joi.string().required(),
        role: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
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