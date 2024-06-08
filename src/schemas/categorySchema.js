import Joi from 'joi';

const INSERT_CATEGORY_SCHEMA = Joi.alternatives().try(
  Joi.object({
    category_name: Joi.string().label('Category Name').required(),
  }),
  Joi.array().items(
    Joi.object({
      category_name: Joi.string().label('Category Name').required(),
    })
  )
);

const UPDATE_CATEGORY_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('Category Id').required(),
  category_name: Joi.string().label('Category Name').required(),
  status: Joi.string()
    .valid('Active', 'Inactive')
    .label('Category Status')
    .optional(),
});

export { INSERT_CATEGORY_SCHEMA, UPDATE_CATEGORY_SCHEMA };
