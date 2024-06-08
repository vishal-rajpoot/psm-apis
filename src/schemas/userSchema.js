import Joi from 'joi';

const userSchema = Joi.object({
  first_name: Joi.string().label('First Name').required(),
  last_name: Joi.string().label('Last Name').required(),
  email: Joi.string().email().label('Email Address').required(),
  contact_no: Joi.string()
    .pattern(/^([+]\d{1,3}[-\s]?)?\d{10}$/)
    .label('Contact Number')
    .required(),
  config: Joi.object().label('Config').optional(),
  role_id: Joi.string().uuid().label('Role ID').required(),
  role: Joi.string()
    .valid('employee', 'vendor', 'admin')
    .label('Role Type')
    .required(),
  designation_id: Joi.string()
    .uuid({ version: 'uuidv4' })
    .label('Designation ID')
    .required(),
});
const arrayOfUsersSchema = Joi.array().items(userSchema);
const INSERT_USER_SCHEMA = Joi.alternatives().try(
  userSchema,
  arrayOfUsersSchema
);

const UPDATE_USER_SCHEMA = Joi.object({
  id: Joi.string().uuid().label('User Id').required(),
  first_name: Joi.string().label('First Name').required(),
  last_name: Joi.string().label('Last Name').required(),
  email: Joi.string().email().label('Email Address').required(),
  contact_no: Joi.string()
    .pattern(/^([+]\d{1,3}[-\s]?)?\d{10}$/)
    .label('Contact Number')
    .required(),
  config: Joi.object().label('Config').optional(),
  status: Joi.string().valid('Active', 'Inactive').label('Status').required(),
  role: Joi.string()
    .valid('employee', 'vendor', 'admin')
    .label('Role Type')
    .required(),
});

const INSERT_USER_SINGUP_SCHEMA = Joi.object({
  companyId: Joi.string().label('companyId').required(),
  first_name: Joi.string().label('First Name').required(),
  last_name: Joi.string().label('Last Name').required(),
  email: Joi.string().email().label('Email Address').required(),
  contact_no: Joi.string()
    .pattern(/^([+]\d{1,3}[-\s]?)?\d{10}$/)
    .label('Contact Number')
    .required(),
  config: Joi.object().label('Config').optional(),
});

const INSERT_MDA_SINGUP_SCHEMA = Joi.object({
  companyId: Joi.string().label('companyId').required(),
  first_name: Joi.string().label('First Name').required(),
  last_name: Joi.string().label('Last Name').required(),
  email: Joi.string().email().label('Email Address').required(),
  contact_no: Joi.string()
    .pattern(/^([+]\d{1,3}[-\s]?)?\d{10}$/)
    .label('Contact Number')
    .required(),
  images: Joi.object()
    .keys({
      aadhar_card_front: Joi.array().label('aadhar_card_front').required(),
      aadhar_card_back: Joi.array().label('aadhar_card_back').required(),
      cv: Joi.array().label('required').optional(),
      pan_card: Joi.array().label('required').optional(),
      bank_detail: Joi.array().label('required').optional(),
    })
    .label('images')
    .required(),
  config: Joi.object().label('Config').optional(),
});

export {
  INSERT_USER_SCHEMA,
  UPDATE_USER_SCHEMA,
  INSERT_USER_SINGUP_SCHEMA,
  INSERT_MDA_SINGUP_SCHEMA,
};
