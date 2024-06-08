import Joi from 'joi';

const UPDATE_TAX_SCHEMA = Joi.object({
  tax: Joi.number().label('Tax').required(),
  gst: Joi.number().label('GST').optional(),
});

export default UPDATE_TAX_SCHEMA;
