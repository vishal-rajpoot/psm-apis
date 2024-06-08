import Joi from 'joi';

const INSERT_DESIGNATION_SCHEMA = Joi.object({
  designation: Joi.string().label('designation').required(),
  role_id: Joi.string().label('role_id').required(),
});

const UPDATE_DESIGNATION_SCHEMA = Joi.object({
  id: Joi.string().uuid().label('designation_id').required(),
  designation: Joi.string().label('designation').required(),
});

const INSERT_DESIGNATION_PRIORITY_SCHEMA = Joi.array().items(
  Joi.object({
    designation: Joi.string().label('designation').required(),
    role_id: Joi.string().label('role_id').required(),
  })
);

export {
  INSERT_DESIGNATION_SCHEMA,
  UPDATE_DESIGNATION_SCHEMA,
  INSERT_DESIGNATION_PRIORITY_SCHEMA,
};
