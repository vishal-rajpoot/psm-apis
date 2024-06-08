import Joi from 'joi';

const INSERT_USER_ASSIGNMENT = Joi.object({
  employeeId: Joi.string().uuid().label('employee_id').required(),
  config: Joi.object().label('config').required(),
});

const UPDATE_USER_ASSIGNMENT = Joi.object({
  parent: Joi.array().label('parent').required(),
  child: Joi.array().label('child').required(),
  vendor: Joi.array().label('vendor').required(),
});

const UPDATE_EMPLOYEE_VENDOR_ASSIGNMENT = Joi.object({
  id: Joi.string().uuid().label('id').required(),
  config: Joi.object()
    .keys({ vendor: Joi.object() })
    .label('config')
    .required(),
});

export {
  INSERT_USER_ASSIGNMENT,
  UPDATE_USER_ASSIGNMENT,
  UPDATE_EMPLOYEE_VENDOR_ASSIGNMENT,
};
