import Joi from 'joi';

const DISCOUNT_SCHEMA = Joi.object({
  based: Joi.string().label('based').required(),
  config: Joi.object().label('Config').required(),
  discount: Joi.alternatives(Joi.number(), Joi.allow(null))
    .label('discount')
    .optional(),
});

export default DISCOUNT_SCHEMA;
