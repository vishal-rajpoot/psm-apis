import Joi from 'joi';

const INSERT_STOCK_SCHEMA = Joi.array().items({
  productId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .label('productId')
    .required(),
  quantity: Joi.number().label('quantity').required(),
  batch_code: Joi.number().label('batch_code').optional(),
});

const INSERT_BULK_STOCK_SCHEMA = Joi.array().items({
  product_name: Joi.string().label('product_name').required(),
  stock_quantity: Joi.number().label('stock_quantity').required(),
});

const UPDATE_STOCK_SCHEMA = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).label('stockId').required(),
  productId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .label('productId')
    .required(),
  quantity: Joi.string().label('quantity').required(),
});

export { INSERT_STOCK_SCHEMA, UPDATE_STOCK_SCHEMA, INSERT_BULK_STOCK_SCHEMA };
