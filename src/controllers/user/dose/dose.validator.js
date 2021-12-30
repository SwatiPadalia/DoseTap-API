const Joi = require('joi');

export const scheduleDoses = {
  body: {
    userId: Joi.number().required(),
  },
};


