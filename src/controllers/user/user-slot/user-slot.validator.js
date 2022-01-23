const Joi = require('joi');

export const create = {
    body: {
        data: Joi.array().max(8).min(1)
            .items({
                slot_id: Joi.number().required(),
                user_id: Joi.number().required(),
                time: Joi.string().required(),
            }),
    }
};