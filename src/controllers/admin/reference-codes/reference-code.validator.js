const Joi = require('joi');

export const create = {
    body: {
        description: Joi.string().required(),
        status: Joi.boolean().optional(),
    }
};