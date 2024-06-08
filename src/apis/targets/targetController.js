import { sendSuccess } from '../../utils/responseHandler';
import {
  ADD_TARGET_SCHEMA,
  UPDATE_TARGET_SCHEMA,
} from '../../schemas/targetSchema';
import { ValidationError } from '../../utils/appErrors';

import {
  getTotalRevenueByCompanyService,
  addTargetService,
  getTotalRevenueByUserService,
  getTargetListService,
  getTargetHierarchyService,
  deleteTargetService,
  updateTargetService,
} from './targetService';

const getTotalRevenueByCompany = async (req, res) => {
  const token = req.user;
  const { userId, designationId, companyId } = req.user;
  const month = req.query.month || null;
  const { year } = req.query;
  const { region } = req.query;
  let payload = {
    token,
    year,
  };
  if (month !== null) {
    payload = {
      token,
      year,
      month,
    };
  }
  const data = await getTotalRevenueByCompanyService(
    payload,
    region,
    userId,
    designationId,
    companyId
  );
  return sendSuccess(
    res,
    { TotalRevenue: data },
    'getting company revenue successfully'
  );
};

const addTarget = async (req, res) => {
  const token = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = ADD_TARGET_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const targetObject = {
    token,
    payload,
  };
  await addTargetService(targetObject);
  return sendSuccess(res, {}, 'target added successfully');
};

const updateTarget = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_TARGET_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateTargetService(companyId, id, payload);
  return sendSuccess(res, data, 'target added successfully');
};

const getTotalRevenueByUser = async (req, res) => {
  const token = req.user;
  let { userId } = req.params;
  if (!req.params.userId) {
    userId = token.userId;
  }
  const date = new Date();
  const month = req.query.month || date.getMonth() + 1;
  const year = req.query.year || date.getFullYear();
  const payload = {
    token,
    id: userId,
    year,
    month,
  };
  const data = await getTotalRevenueByUserService(payload);
  return sendSuccess(
    res,
    { TotalRevenue: data },
    'getting revenue successfully'
  );
};

const getTargetList = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    companyId,
    searchText,
    page: page || 1,
    limit: limit || 10,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getTargetListService(payload);
  return sendSuccess(
    res,
    { target_list: data },
    'getting target list data successfully'
  );
};

const getTargetHierarchy = async (req, res) => {
  const token = req.user;
  let { year } = req.query;
  let { month } = req.query;

  if (month === undefined || year === undefined) {
    const date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
  }
  const { id } = req.params;
  const data = await getTargetHierarchyService(token, month, year, id);
  return sendSuccess(
    res,
    { target_list: data },
    'getting target list data successfully'
  );
};

const deleteTarget = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await deleteTargetService(companyId, id);
  return sendSuccess(res, data, 'target deleted successfully');
};

export {
  addTarget,
  getTotalRevenueByCompany,
  getTotalRevenueByUser,
  getTargetList,
  getTargetHierarchy,
  updateTarget,
  deleteTarget,
};
