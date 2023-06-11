const Joi = require("joi");
const versionPatternExp = `^(([1-9]+\d*\.)+[1-9]+\d*)|[1-9]+\d*$`;
export const create = {
  body: {
    version: Joi.string().regex(new RegExp(versionPatternExp)).required(),
    fileUrl: Joi.string().uri().required(),
  },
};

export const update = {
  body: {
    version: Joi.string().regex(new RegExp(versionPatternExp)).required(),
    fileUrl: Joi.string().uri().required(),
  },
};
