const Joi = require('joi');

export const create = {
    body: {
        title: Joi.string().required(),
        description: Joi.string().required(),
        shortDescription: Joi.string().required(),
        url: Joi.string().optional(),
        type: Joi.string().required(),
    }
};

export const update = {
    body: {
        title: Joi.string().required(),
        description: Joi.string().required(),
        shortDescription: Joi.string().optional(),
        url: Joi.string().optional(),
        type: Joi.string().required(),
    }
};
