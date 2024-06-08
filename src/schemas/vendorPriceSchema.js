import Joi from 'joi';

const INSERT_PRICE = Joi.object({
  region: Joi.string().label('region').required(),
  config: Joi.object().label('config').required(),
  price: Joi.number().label('price').required(),
});

const UPDATE_PRICE = Joi.object({
  id: Joi.string().uuid().label('id').required(),
  region: Joi.string().label('region').required(),
  price: Joi.number().label('price').required(),
  config: Joi.object().label('config').required(),
});

export { INSERT_PRICE, UPDATE_PRICE };
