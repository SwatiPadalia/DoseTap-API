const Joi = require('joi');

export const createCompany = {
    body: {
        name: Joi.string().required(),
    }
};

export const updateCompany = {
    body: {
        name: Joi.string().required(),
    }
};
