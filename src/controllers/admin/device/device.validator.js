const Joi = require("joi");

export const createDevice = {
  body: {
    name: Joi.string().required(),
    serialNumber: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    firmwareVersion: Joi.string().required(),
  },
};

export const updateDevice = {
  body: {
    name: Joi.string().required(),
    serialNumber: Joi.string().required(),
    description: Joi.string().allow("").required(),
    status: Joi.boolean().allow("").optional(),
    isSold: Joi.boolean().allow("").optional(),
    firmwareVersion: Joi.string().required(),
  },
};

export const tagDevice = {
  body: {
    device_id: Joi.number().required(),
    company_id: Joi.number().required(),
  },
};
