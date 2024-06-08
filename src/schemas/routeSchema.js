import Joi from 'joi';

const INSERT_ROUTE_SCHEMA = Joi.object({
  route_name: Joi.string().label('route_name').required(),
  config: Joi.object()
    .keys({
      status: Joi.number(),
      assigned_employee: Joi.object().optional(),
      vendors: Joi.array(),
      notes: Joi.string().allow('').optional(),
    })
    .label('config')
    .required(),
});

const UPDATE_ROUTE_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('Route Id').required(),
  route_name: Joi.string().label('route_name').required(),
  config: Joi.object()
    .keys({
      status: Joi.number(),
      assigned_employee: Joi.object().required(),
      vendors: Joi.array(),
      notes: Joi.string().allow('').optional(),
    })
    .label('config')
    .required(),
});

const UPDATE_EMPLOYEE_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('Route Id').required(),
  assigned_employee: Joi.object()
    .keys({
      employee_id: Joi.string()
        .uuid({ version: 'uuidv4' })
        .label('employee Id')
        .required(),
      employee_name: Joi.string().label('route_name').required(),
    })
    .label('assigned_employee')
    .required(),
});

export { INSERT_ROUTE_SCHEMA, UPDATE_ROUTE_SCHEMA, UPDATE_EMPLOYEE_SCHEMA };
