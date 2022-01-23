const Joi = require('joi');

export const create = {
    body: {
        slot_id: Joi.number().required(),
        user_id: Joi.number().required(),
        time: Joi.string().required(),
    }
};