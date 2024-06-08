import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_CATEGORY_SCHEMA,
  UPDATE_CATEGORY_SCHEMA,
} from '../../schemas/categorySchema';
import { sendSuccess } from '../../utils/responseHandler';
import {
  getAllCategoriesService,
  getCategoryByIdService,
  addCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from './categoryService';

const getAllCategories = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page,
    limit,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
  };

  const data = await getAllCategoriesService(companyId, payload);
  return sendSuccess(
    res,
    { categories: data },
    'getting categories data successfully'
  );
};

const getCategoryById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;

  const data = await getCategoryByIdService(companyId, id);
  return sendSuccess(res, data, 'getting category data successfully');
};

const addCategory = async (req, res) => {
  const { companyId, userId } = req.user;
  const value = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_CATEGORY_SCHEMA.validate(value, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addCategoryService(companyId, userId, value);
  return sendSuccess(res, { categories: data }, 'category added successfully');
};

const updateCategory = async (req, res) => {
  const token = req.user;
  const payload = req.body;
  const { id } = req.params;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_CATEGORY_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateCategoryService(id, token, payload);
  return sendSuccess(
    res,
    { categories: data },
    'category updated successfully'
  );
};

const deleteCategory = async (req, res) => {
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const data = await deleteCategoryService(id, companyId, userId);
  return sendSuccess(
    res,
    { deletedCategories: data },
    'category deleted successfully'
  );
};

export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};
