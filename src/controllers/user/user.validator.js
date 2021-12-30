const Joi = require('joi');

export const getOtherUserProfile = {
  body: {
    userId: Joi.number().required(),
  },
};

export const changePassword = {
  body: {
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  },
};

export const update = {
  body: {
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    age: Joi.number().required(),
    gender: Joi.string().required(),
    city: Joi.string().required(),
    phone: Joi.string().max(10).required()
      .options({
        language: {
          key: '{{key}} ',
          any: { required: `is required` },
          string: { max: `must be at least 10 digits` },
        }
      }),
  },
};