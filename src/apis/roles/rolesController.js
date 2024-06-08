import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_ROLE_SCHEMA,
  UPDATE_ROLE_SCHEMA,
} from '../../schemas/roleSchema';
import { sendSuccess } from '../../utils/responseHandler';

import {
  getRolesService,
  getRoleByIdService,
  updateRoleService,
  addRoleService,
  deleteRoleService,
} from './rolesService';

const getRoles = async (req, res) => {
  const token = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page: page || 1,
    limit: limit || 10,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
  };
  const data = await getRolesService(token, payload);
  return sendSuccess(res, { Roles: data }, 'getting roles data successfully');
};

const getRoleById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getRoleByIdService(companyId, id);
  return sendSuccess(res, data, 'getting role successfully');
};

const updateRole = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_ROLE_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateRoleService(token, payload, id);
  return sendSuccess(res, data, 'role updated successfully');
};

const addRole = async (req, res) => {
  const token = req.user;
  const value = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_ROLE_SCHEMA.validate(value, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addRoleService(token, value);
  return sendSuccess(res, data, 'role added successfully');
};

const deleteRole = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const data = await deleteRoleService(token, id);
  return sendSuccess(res, data, 'role deleted successfully');
};

export { getRoles, getRoleById, updateRole, addRole, deleteRole };
