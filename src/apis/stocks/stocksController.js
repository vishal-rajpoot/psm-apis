import { sendSuccess } from '../../utils/responseHandler';
import { uploadXLSX } from '../../utils/convertjson';
import {
  getStocksService,
  getStocksByIdService,
  addStockService,
  uploadProductStockService,
  updateStockService,
  removeStockService,
} from './stocksService';
import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_STOCK_SCHEMA,
  UPDATE_STOCK_SCHEMA,
  INSERT_BULK_STOCK_SCHEMA,
} from '../../schemas/stockSchema';

const getStocks = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page,
    limit,
    searchText,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getStocksService(companyId, payload);
  return sendSuccess(res, { stockList: data }, 'getting stocks successfully');
};

const getStocksById = async (req, res) => {
  const { id } = req.params;
  const data = await getStocksByIdService(req, id);
  return sendSuccess(res, data, 'getting stocks successfully');
};

const addStock = async (req, res) => {
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_STOCK_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addStockService(req);
  return sendSuccess(res, { stocks: data }, 'stock added successfully');
};

const uploadProductStockFile = async (req, res) => {
  const excelData = await uploadXLSX(req, res);

  const options = { abortEarly: false };
  const joiValidation = INSERT_BULK_STOCK_SCHEMA.validate(excelData, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await uploadProductStockService(excelData, req);
  return sendSuccess(
    res,
    { stocks: data },
    'Product Stock bulk upload successfully'
  );
};

const updateStock = async (req, res) => {
  const payload = req.body;
  const { id } = req.params;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_STOCK_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateStockService(req);
  return sendSuccess(res, data, 'stock update successfully');
};

const removeStock = async (req, res) => {
  const { id } = req.params;
  const { companyId } = req.user;
  const data = await removeStockService(id, companyId);
  return sendSuccess(res, data, 'stock removed successfully');
};

export {
  uploadProductStockFile,
  getStocks,
  addStock,
  updateStock,
  removeStock,
  getStocksById,
};
