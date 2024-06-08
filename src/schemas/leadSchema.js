import Joi from 'joi';

const INSERT_LEAD_SCHEMA = Joi.object({
  first_name: Joi.string().label('first_name').required(),
  last_name: Joi.string().label('last_name').required(),
  contact_no: Joi.string()
    .pattern(/^([+]\d{1,3}[-\s]?)?\d{10}$/)
    .label('contact_no')
    .required(),
  designation_id: Joi.string()
    .uuid({ version: 'uuidv4' })
    .label('designation_id')
    .required(),
  config: Joi.object().label('config').optional(),
  employee_id: Joi.string().uuid().label('employee_id').optional(),
});

const INSERT_BULK_LEAD_SCHEMA = Joi.array().items({
  first_name: Joi.string().label('first_name').required(),
  last_name: Joi.string().label('last_name').required(),
  contact_no: Joi.number().integer().label('contact_no').required(),
  designation: Joi.string().label('designation').required(),
  company: Joi.string().label('company').required(),
  address: Joi.string().label('address').required(),
});

const UPDATE_LEAD_SCHEMA = Joi.object({
  id: Joi.string().uuid().label('User Id').required(),
  first_name: Joi.string().label('first_name').required(),
  last_name: Joi.string().label('last_name').required(),
  contact_no: Joi.string()
    .pattern(/^([+]\d{1,3}[-\s]?)?\d{10}$/)
    .label('contact_no')
    .required(),
  designation_id: Joi.string()
    .uuid({ version: 'uuidv4' })
    .label('designation_id')
    .required(),
  config: Joi.object().label('config').optional(),
  employee_id: Joi.string().uuid().label('employee_id').optional(),
});

export { INSERT_LEAD_SCHEMA, UPDATE_LEAD_SCHEMA, INSERT_BULK_LEAD_SCHEMA };
