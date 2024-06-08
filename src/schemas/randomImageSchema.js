import Joi from 'joi';

const UPDATE_RANDOM_IMAGE_SCHEMA = Joi.object({
  random_image: Joi.number().label('Random Image').required(),
});

const INSERT_RANDOM_IMAGE_SCHEMA = Joi.object({
  image: Joi.object()
    .keys({
      user_selfie: Joi.array().label('Selfie').required(),
    })
    .label('image')
    .required(),
});

export { INSERT_RANDOM_IMAGE_SCHEMA, UPDATE_RANDOM_IMAGE_SCHEMA };
