import Joi from 'joi';

const INSERT_UNIT_SCHEMA = Joi.alternatives().try(
  Joi.object({
    unit: Joi.string().label('unit').required(),
  }),
  Joi.array().items(
    Joi.object({
      unit: Joi.string().label('unit').required(),
    })
  )
);

const UPDATE_UNIT_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('unit Id').required(),
  unit: Joi.string().label('unit').required(),
});

const UPDATE_UNIT_HIERARCHY_SCHEMA = Joi.array().items({
  id: Joi.string().label('unit Id').required(),
  unit: Joi.string().label('unit').required(),
  position: Joi.number().label('position').required(),
});

export { INSERT_UNIT_SCHEMA, UPDATE_UNIT_SCHEMA, UPDATE_UNIT_HIERARCHY_SCHEMA };
