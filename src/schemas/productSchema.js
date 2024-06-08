import Joi from 'joi';

const productSchema = Joi.object({
  name: Joi.string().label('Name').required(),
  hsncode: Joi.string().label('Hsncode').required(),
  mrp: Joi.number().label('MRP').required(),
  categoryId: Joi.string().label('Category ID').required(),
  config: Joi.object({
    package: Joi.string().label('Package'),
    quantityOfPackage: Joi.number().label('Quantity of Package'),
    vendorPrices: Joi.object().label('Vendor Prices'),
    vendorPackages: Joi.object().label('Vendor Packages'),
  })
    .label('Config')
    .required(),
  employees: Joi.array()
    .items(Joi.string().label('Employee ID'))
    .label('Employees')
    .required(),
});

const arrayOfProductsSchema = Joi.array().items(productSchema);
const INSERT_PRODUCT_SCHEMA = Joi.alternatives().try(
  productSchema,
  arrayOfProductsSchema
);

const INSERT_BULK_PRODUCT_SCHEMA = Joi.array().items({
  name: Joi.string().label('product_name').required(),
  hsncode: Joi.number().label('product_hsncode').required(),
  mrp: Joi.number().label('mrp').required(),
  category: Joi.string().label('category').required(),
  quantity: Joi.number().label('mrp').required(),
  package: Joi.string().label('package_name').required(),
});

const INSERT_BULK_PRODUCT_FOR_MEGHMANI_SCHEMA = Joi.array().items({
  group_code: Joi.string().label('group_code').required(),
  category: Joi.string().label('group_name').required(),
  name: Joi.string().label('product_name').required(),
  matriyalCode: Joi.number().label('material_code').required(),
  uom: Joi.string().label('uom').optional(),
  batch: Joi.string().label('batch').optional(),
  mfgDate: Joi.string().label('mfg_date').optional(),
  expDate: Joi.string().label('exp_date').optional(),
  Qty: Joi.string().label('qty_kg/ltr').optional(),
});

const UPDATE_PRODUCT_SCHEMA = Joi.object({
  id: Joi.string().uuid().label('product_id').required(),
  name: Joi.string().label('name').required(),
  hsncode: Joi.string().label('hsncode').required(),
  mrp: Joi.number().label('mrp').required(),
  categoryId: Joi.string().label('categoryId').required(),
  config: Joi.object()
    .keys({
      package: Joi.string(),
      quantityOfPackage: Joi.number(),
      vendorPrices: Joi.object(),
      vendorPackages: Joi.object(),
    })
    .label('config')
    .required(),
  employees: Joi.array().label('employees').required(),
});

const UPDATE_PRODUCT_STATUS_SCHEMA = Joi.object({
  id: Joi.string().uuid().label('product_id').required(),
  status: Joi.string().valid('Inactive', 'Active').label('status').required(),
});

export {
  UPDATE_PRODUCT_SCHEMA,
  INSERT_PRODUCT_SCHEMA,
  UPDATE_PRODUCT_STATUS_SCHEMA,
  INSERT_BULK_PRODUCT_SCHEMA,
  INSERT_BULK_PRODUCT_FOR_MEGHMANI_SCHEMA,
};
