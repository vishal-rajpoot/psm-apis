import Joi from 'joi';

const INSERT_ROLE_SCHEMA = Joi.object({
  role: Joi.string().label('role').required(),
});

const UPDATE_ROLE_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('Role Id').required(),
  role: Joi.string().label('role').required(),
});

export { INSERT_ROLE_SCHEMA, UPDATE_ROLE_SCHEMA };
