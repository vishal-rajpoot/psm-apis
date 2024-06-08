import Joi from 'joi';

const INSERT_COMPANY_SCHEMA = Joi.object({
  first_name: Joi.string().label('First name').required(),
  last_name: Joi.string().label('Last name').required(),
  company_name: Joi.string().label('Company name').required(),
  email: Joi.string().label('Email').required(),
  contact_no: Joi.number().label('Contact no').required(),
  address: Joi.string().label('Address').required(),
  city: Joi.string().label('City').required(),
  state: Joi.string().label('State').required(),
  pincode: Joi.string().label('Pincode').required(),
  country: Joi.string().label('Country').required(),
  config: Joi.object().label('Config').optional(),
});

const UPDATE_COMPANY_SCHEMA = Joi.object({
  negative_stock: Joi.number().label('Negative Stock').required(),
});

const UPDATE_LABELING = Joi.object({
  labels: Joi.object().label('labels').required(),
});

const OTP_VERIFY = Joi.object({
  mobile_otp: Joi.number().label('Mobile otp').required(),
  email_otp: Joi.number().label('Email otp').required(),
  mobile_no: Joi.number().label('Mobile No').required(),
  email: Joi.string().email().label('Email Address').required(),
});
export {
  INSERT_COMPANY_SCHEMA,
  UPDATE_COMPANY_SCHEMA,
  UPDATE_LABELING,
  OTP_VERIFY,
};
