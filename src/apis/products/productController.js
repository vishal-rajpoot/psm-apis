import { sendSuccess } from '../../utils/responseHandler';
import { uploadXLSX } from '../../utils/convertjson';
import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_PRODUCT_SCHEMA,
  UPDATE_PRODUCT_SCHEMA,
  UPDATE_PRODUCT_STATUS_SCHEMA,
  INSERT_BULK_PRODUCT_SCHEMA,
  INSERT_BULK_PRODUCT_FOR_MEGHMANI_SCHEMA,
} from '../../schemas/productSchema';

import {
  getAllProductsService,
  getProductByIdService,
  addProductService,
  updateProductService,
  updateProductStatusService,
  deleteProductService,
  uploadProductService,
  getAllEmployeesAssignedToProductsService,
  getAllUnassignedEmployeeForProductIdService,
  uploadMeghmaniProductService,
} from './productService';

const getAllProducts = async (req, res) => {
  const token = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    token,
    page,
    limit,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
  };
  const data = await getAllProductsService(payload);
  return sendSuccess(
    res,
    { productList: data },
    'getting products data successfully'
  );
};

const getProductById = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const payload = {
    id,
    token,
  };
  const data = await getProductByIdService(payload);
  return sendSuccess(res, { products: data }, 'getting product successfully');
};

const addProduct = async (req, res) => {
  const token = req.user;
  const { body } = req;
  const options = { abortEarly: false };
  const joiValidation = INSERT_PRODUCT_SCHEMA.validate(body, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addProductService(body, token);
  return sendSuccess(res, data, 'product added successfully');
};

const updateProduct = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const { body } = req;
  const payload = {
    id,
    token,
    body,
  };
  const options = { abortEarly: false };
  const joiValidation = UPDATE_PRODUCT_SCHEMA.validate(
    { id, ...body },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateProductService(payload);
  return sendSuccess(res, { product: data }, 'product updated successfully');
};

const updateProductStatus = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const { body } = req;
  const payload = {
    id,
    token,
    body,
  };
  const options = { abortEarly: false };
  const joiValidation = UPDATE_PRODUCT_STATUS_SCHEMA.validate(
    { id, ...body },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateProductStatusService(payload);
  return sendSuccess(res, { product: data }, 'product updated successfully');
};

const deleteProduct = async (req, res) => {
  const { companyId, userId } = req.user;
  const { id } = req.params;

  const data = await deleteProductService(id, companyId, userId);
  return sendSuccess(res, { product: data }, 'product deleted successfully');
};

const uploadProductFile = async (req, res) => {
  const excelData = await uploadXLSX(req, res);
  const options = { abortEarly: false };
  const joiValidation = INSERT_BULK_PRODUCT_SCHEMA.validate(excelData, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await uploadProductService(excelData, req);
  return sendSuccess(
    res,
    { product: data },
    'Products bulk upload successfully'
  );
};

const uploadProductFileForMeghmani = async (req, res) => {
  const excelData = await uploadXLSX(req, res);
  // const options = { abortEarly: false };
  // const joiValidation = INSERT_BULK_PRODUCT_FOR_MEGHMANI_SCHEMA.validate(
  //   excelData,
  //   options
  // );
  // if (joiValidation.error) {
  //   throw new ValidationError(joiValidation.error);
  // }
  const data = await uploadMeghmaniProductService(excelData, req);
  return sendSuccess(
    res,
    { product: data },
    'Products bulk upload successfully'
  );
};
const getAllEmployeesAssignedToProductId = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const data = await getAllEmployeesAssignedToProductsService(id, token);
  return sendSuccess(
    res,
    { assignedEmployees: data },
    'getting employee product relation successfully'
  );
};

const getAllUnassignedEmployeeForProductId = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const { role_id } = req.query;
  const data = await getAllUnassignedEmployeeForProductIdService(
    id,
    token,
    role_id
  );
  return sendSuccess(
    res,
    { unassignedEmployees: data },
    'getting unassigned employee for product successfully'
  );
};

export {
  uploadProductFile,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getAllEmployeesAssignedToProductId,
  getAllUnassignedEmployeeForProductId,
  uploadProductFileForMeghmani,
};
