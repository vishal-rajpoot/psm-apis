import Joi from 'joi';

const ADD_TARGET_SCHEMA = Joi.object({
  source_user: Joi.string().label('source_user').required(),
  month: Joi.number().label('month').required(),
  year: Joi.number().label('years').required(),
  target: Joi.array().label('target').required(),
});

const UPDATE_TARGET_SCHEMA = Joi.object({
  amount: Joi.number().label('amount').required(),
  month: Joi.number().label('month').required(),
  year: Joi.number().label('year').required(),
  updated_by: Joi.string().uuid().label('updated_by').required(),
});

export { ADD_TARGET_SCHEMA, UPDATE_TARGET_SCHEMA };
