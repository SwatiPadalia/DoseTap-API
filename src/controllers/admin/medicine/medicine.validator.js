const Joi = require('joi');

export const create = {
    body: {
        name: Joi.string().required(),
        companyName: Joi.string().required(),
        code: Joi.string().required(),
    }
};

export const update = {
    body: {
        name: Joi.string().required(),
        companyName: Joi.string().required(),
        code: Joi.string().required(),
    }
};
