import { sendSuccess } from '../../utils/responseHandler';
import { ValidationError } from '../../utils/appErrors';
import { INSERT_PRICE, UPDATE_PRICE } from '../../schemas/vendorPriceSchema';

import {
  getPriceListService,
  addPriceService,
  updatePriceService,
  deletePriceService,
} from './vendorPriceService';

const getPriceList = async (req, res) => {
  const token = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page: page || 1,
    limit: limit || 10,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
  };
  const data = await getPriceListService(token, payload);
  return sendSuccess(
    res,
    { priceList: data },
    'getting price list successfully'
  );
};

const addPrice = async (req, res) => {
  const payload = req.body;
  const token = req.user;
  const options = { abortEarly: false };
  const joiValidation = INSERT_PRICE.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addPriceService(payload, token);
  return sendSuccess(res, data, 'price added successfully');
};

const updatePrice = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_PRICE.validate({ id, ...payload }, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updatePriceService(payload, id, token);
  return sendSuccess(res, data, 'price updated successfully');
};

const deletePrice = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const data = await deletePriceService(id, token);
  return sendSuccess(res, data, 'price deleted successfully');
};

export { getPriceList, addPrice, updatePrice, deletePrice };
