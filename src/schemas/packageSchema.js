import Joi from 'joi';

const INSERT_PACKAGE_SCHEMA = Joi.object({
  package_name: Joi.string().label('package_name').required(),
  config: Joi.object()
    .keys({
      status: Joi.string().valid('Inactive', 'Active'),
      quantityOfPackage: Joi.number(),
      packageQty: Joi.number(),
      packageUnit: Joi.string(),
      packageSubUnit: Joi.string(),
      packages: Joi.array(),
    })
    .label('config')
    .required(),
});

const UPDATE_PACKAGE_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('Package Id').required(),
  package_name: Joi.string().label('package_name').required(),
  config: Joi.object()
    .keys({
      status: Joi.string().valid('Inactive', 'Active'),
      quantityOfPackage: Joi.number(),
      packageQty: Joi.number(),
      packageUnit: Joi.string(),
      packageSubUnit: Joi.string(),
      packages: Joi.array(),
    })
    .label('config')
    .required(),
});

const UPDATE_PACKAGE_STATUS_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('Package Id').required(),
  status: Joi.string().valid('Inactive', 'Active').label('status').required(),
});

export {
  INSERT_PACKAGE_SCHEMA,
  UPDATE_PACKAGE_SCHEMA,
  UPDATE_PACKAGE_STATUS_SCHEMA,
};
