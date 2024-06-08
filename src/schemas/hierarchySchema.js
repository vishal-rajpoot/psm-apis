import Joi from 'joi';

const INSERT_HIERARCHY_SCHEMA = Joi.object({
  employee: Joi.object().label('employee').required(),
  vendor: Joi.object().label('vendor').required(),
  relations: Joi.array().label('relations').required(),
});

const UPDATE_HIERARCHY_SCHEMA = Joi.object({
  id: Joi.string().uuid().label('hierarchy_id').required(),
  employee: Joi.object().label('employee').optional(),
  vendor: Joi.object().label('vendor').optional(),
});

const UPDATE_HIERARCHY_RELATION_SCHEMA = Joi.object({
  id: Joi.string().uuid().label('hierarchy_id').required(),
  source: Joi.string().uuid().label('source').required(),
  destination: Joi.string().uuid().label('destination').required(),
  config: Joi.object().keys().label('config').required(),
});

export {
  INSERT_HIERARCHY_SCHEMA,
  UPDATE_HIERARCHY_SCHEMA,
  UPDATE_HIERARCHY_RELATION_SCHEMA,
};
