import { sendSuccess } from '../../utils/responseHandler';
import {
  INSERT_DESIGNATION_PRIORITY_SCHEMA,
  INSERT_DESIGNATION_SCHEMA,
  UPDATE_DESIGNATION_SCHEMA,
} from '../../schemas/designationSchema';
import {
  getDesignationsService,
  getDesignationByIdService,
  deleteDesignationService,
  addDesignationService,
  updateDesignationService,
  getDesignationsByRoleIdService,
  addDesignationPriorityService,
} from './designationService';
import { ValidationError } from '../../utils/appErrors';

const getDesignations = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column, searchText, dept } = req.query;
  const payload = {
    page,
    limit,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
    dept,
  };

  const data = await getDesignationsService(companyId, payload);
  return sendSuccess(
    res,
    { Designations: data },
    'getting designations data successfully'
  );
};

const getDesignationById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;

  const data = await getDesignationByIdService(companyId, id);
  return sendSuccess(
    res,
    data,
    `getting designation data by ${id} successfully`
  );
};

const updateDesignation = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_DESIGNATION_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateDesignationService(companyId, id, payload);
  return sendSuccess(res, data, 'designations updated successfully');
};

const addDesignation = async (req, res) => {
  const { companyId, userId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_DESIGNATION_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addDesignationService(companyId, userId, payload);
  return sendSuccess(res, data, 'designation data added successfully');
};

const deleteDesignation = async (req, res) => {
  const { companyId, userId } = req.user;
  const { id } = req.params;

  const data = await deleteDesignationService(companyId, userId, id);
  return sendSuccess(res, data, 'designation deleted successfully');
};

const getDesignationsByRoleId = async (req, res) => {
  const token = req.user;
  const { id } = req.params;

  const data = await getDesignationsByRoleIdService(token, id);
  return sendSuccess(
    res,
    { Designations: data },
    'getting designations successfully'
  );
};

const addDesignationPriority = async (req, res) => {
  const { companyId, userId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_DESIGNATION_PRIORITY_SCHEMA.validate(
    payload,
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addDesignationPriorityService(companyId, userId, payload);
  return sendSuccess(res, data, 'designation data added successfully');
};

export {
  getDesignations,
  getDesignationById,
  updateDesignation,
  addDesignation,
  deleteDesignation,
  getDesignationsByRoleId,
  addDesignationPriority,
};
