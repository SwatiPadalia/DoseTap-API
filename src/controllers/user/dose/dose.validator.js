const Joi = require('joi');

export const scheduleDoses = {
  body: {
    data: Joi.array().items(Joi.object({
      medicine_id: Joi.number().required(),
      slot_id: Joi.number().required(),
      time: Joi.string().required(),
      days: Joi.array().required(),
      count: Joi.number().required()
    })
    ),
  }
};


