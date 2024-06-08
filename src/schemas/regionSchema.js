import Joi from 'joi';

const INSERT_REGION_SCHEMA = Joi.alternatives().try(
  Joi.object({
    region: Joi.string().label('region Name').required(),
  }),
  Joi.array().items(
    Joi.object({
      region: Joi.string().label('region Name').required(),
    })
  )
);

const UPDATE_REGION_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('region Id').required(),
  region: Joi.string().label('region Name').required(),
});

export { INSERT_REGION_SCHEMA, UPDATE_REGION_SCHEMA };
