import { sendSuccess } from '../../utils/responseHandler';
import {
  addDiscountService,
  deleteDiscountService,
  getAllDiscountsService,
  getDiscountByIdService,
  updateDiscountService,
} from './discountService';
import DISCOUNT_SCHEMA from '../../schemas/discountSchema';
import { ValidationError } from '../../utils/appErrors';

const getAllDiscounts = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column } = req.query;
  const payload = {
    page,
    limit,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getAllDiscountsService(companyId, payload);
  return sendSuccess(
    res,
    { discounts: data },
    'getting discounts successfully'
  );
};

const getDiscountById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getDiscountByIdService(companyId, id);
  return sendSuccess(res, { data }, 'getting discount by id successfully');
};

const addDiscount = async (req, res) => {
  const { companyId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = DISCOUNT_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addDiscountService(companyId, payload);
  return sendSuccess(res, { discount: data }, 'discount added successfully');
};

const updateDiscount = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = DISCOUNT_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateDiscountService(companyId, id, payload);
  return sendSuccess(
    res,
    { updatedRows: data },
    'update discount successfully'
  );
};

const deleteDiscount = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await deleteDiscountService(id, companyId);
  return sendSuccess(res, data, 'delete discount successfully');
};

export {
  getAllDiscounts,
  getDiscountById,
  addDiscount,
  updateDiscount,
  deleteDiscount,
};
