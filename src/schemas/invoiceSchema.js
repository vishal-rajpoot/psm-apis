import Joi from 'joi';

const INSERT_INVOICE_PREFIX_SCHEMA = Joi.object({
  invoice: Joi.array().label('invoice').required(),
});

const INVOICE_SCHEMA = Joi.object({
  company_id: Joi.string().uuid().label('company_id').required(),
  company_name: Joi.string().label('company_name').required(),
  invoice_number: Joi.string().label('invoice_number').required(),
  invoice_date: Joi.string().label('invoice_date').required(),
  invoice_reverse_charge: Joi.string()
    .label('invoice_reverse_charge')
    .required(),
  state: Joi.string().label('state').required(),
  po_no_verbal_date: Joi.string().label('po_no_verbal_date').required(),
  freight_paid: Joi.string().label('freight_paid').required(),
  pop: Joi.string().label('pop').required(),
  catalog: Joi.string().label('catalog').required(),
  products: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().label('product_id').required(),
        name: Joi.string().label('product_name').required(),
        price: Joi.number().strict().label('price').required(),
        qty: Joi.number().strict().label('qty').required(),
      })
    )
    .label('product')
    .required(),
  address: Joi.object().label('address').optional(),
});

export { INSERT_INVOICE_PREFIX_SCHEMA, INVOICE_SCHEMA };
