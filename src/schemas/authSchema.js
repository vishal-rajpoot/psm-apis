import Joi from 'joi';

const INSERT_AUTH_SCHEMA = Joi.object({
  username: Joi.string().label('username').required(),
  // password: Joi.string().label('password').required(),
  otp: Joi.string().label('otp').required(),
  config: Joi.object()
    .keys({ source: Joi.string(), fcmToken: Joi.string() })
    .label('config')
    .required(),
});

const CONFIRM_COMPANY_SCHEMA = Joi.object({
  token: Joi.string().label('token').required(),
});

export { INSERT_AUTH_SCHEMA, CONFIRM_COMPANY_SCHEMA };