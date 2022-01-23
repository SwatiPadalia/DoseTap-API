const Joi = require('joi');

export const scheduleDoses = {
  body: {
    data: Joi.object({
      medicine_id: Joi.number().required(),
      slot_ids: Joi.array().required(),
      days: Joi.array().required(),
      count_morning: Joi.number().required(),
      count_afternoon: Joi.number().required(),
      count_evening: Joi.number().required(),
      count_night: Joi.number().required()
    }),
  }
};

export const updateDoses = {
  body: {
    slot_ids: Joi.array().required(),
    days: Joi.array().required(),
    count_morning: Joi.number().required(),
    count_afternoon: Joi.number().required(),
    count_evening: Joi.number().required(),
    count_night: Joi.number().required()
  }
};


