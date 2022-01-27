const Joi = require('joi');

export const createOrUpdate = {
    body: {
        value: Joi.string().required(),
        recordDate: Joi.string().required(),
    }
};