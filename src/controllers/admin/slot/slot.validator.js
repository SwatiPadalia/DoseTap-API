const Joi = require('joi');

export const create = {
    body: {
        name: Joi.string().required(),
        type: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        order: Joi.number().required(),
        displayName: Joi.string().required(),
        displayType: Joi.string().required(),
    }
};


export const update = {
    body: {
        name: Joi.string().required(),
        type: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        order: Joi.number().required(),
        displayName: Joi.string().required(),
        displayType: Joi.string().required(),
    },
};