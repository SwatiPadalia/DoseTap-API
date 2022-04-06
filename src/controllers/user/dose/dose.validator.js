const Joi = require('joi');

export const scheduleDoses = {
  body: {
    data: Joi.object({
      medicine_id: Joi.number().required(),
      slot_ids: Joi.array().required(),
      days: Joi.array().required(),
      count_morning: Joi.array().required(),
      count_afternoon: Joi.array().required(),
      count_evening: Joi.array().required(),
      count_night: Joi.array().required()
    }),
  }
};

export const updateDoses = {
  body: {
    slot_ids: Joi.array().required(),
    days: Joi.array().required(),
    count_morning: Joi.array().required(),
    count_afternoon: Joi.array().required(),
    count_evening: Joi.array().required(),
    count_night: Joi.array().required()
  }
};

export const acceptReject = {
  body: {
    status: Joi.number().valid(1, 0).required()
  }
}


