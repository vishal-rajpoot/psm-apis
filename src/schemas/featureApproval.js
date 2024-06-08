import Joi from 'joi';

const INSERT_FEATURE_APPROVAL_SCHEMA = Joi.array().items({
  designation_id: Joi.string()
    .uuid({ version: 'uuidv4' })
    .label('designation_id')
    .required(),
  designation: Joi.string().label('designation').optional(),
  config: Joi.array()
    .items({ feature: Joi.string(), status: Joi.string() })
    .label('config')
    .required(),
});

export default {};
export { INSERT_FEATURE_APPROVAL_SCHEMA };
