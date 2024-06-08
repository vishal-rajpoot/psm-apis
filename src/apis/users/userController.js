import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_USER_SCHEMA,
  UPDATE_USER_SCHEMA,
  INSERT_USER_SINGUP_SCHEMA,
  INSERT_MDA_SINGUP_SCHEMA,
} from '../../schemas/userSchema';
import { sendSuccess } from '../../utils/responseHandler';
import { uploadXLSX } from '../../utils/convertjson';

import {
  getUsersService,
  getUserByIdService,
  deleteUserService,
  addUserService,
  updateUserService,
  signupUserService,
  getUsersByDesignationService,
  uploadUserService,
  updateUserDesignationService,
  updateUserPasswordService,
  getDeletedUsersByDesignationService,
  assigneDeleteUserService,
  registeredUserService,
  statusChangetByIdService,
  getEmployeeService,
  uploadEmployeeService,
  uploadCustomerService,
  signupMdaService,
} from './userService';

const getUsers = async (req, res) => {
  const { companyId, userId, designationId } = req.user;
  const {
    role,
    region,
    page,
    limit,
    sort,
    column,
    searchText,
    status,
    deleted,
    designation,
  } = req.query;
  const payload = {
    page,
    limit,
    searchText,
    status,
    deleted,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };

  const data = await getUsersService(
    companyId,
    role,
    region,
    payload,
    designation,
    designationId,
    userId
  );
  return sendSuccess(res, { users: data }, 'getting Users data successfully');
};
const getEmployee = async (req, res) => {
  const { companyId, roleId } = req.user;
  const data = await getEmployeeService(companyId, roleId);
  return sendSuccess(res, { users: data }, 'getting Users data successfully');
};

const getUserById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;

  const data = await getUserByIdService(companyId, id);
  return sendSuccess(
    res,
    { user: data },
    'getting User data by id successfully'
  );
};

const RegisteredUser = async (req, res) => {
  const { companyId, designation_name, userId } = req.user;
  const { status } = req.query;
  const data = await registeredUserService(
    companyId,
    status,
    designation_name,
    userId
  );
  return sendSuccess(res, data, 'Get User successfully');
};
const getUsersByDesignation = async (req, res) => {
  const { companyId } = req.user;
  const { designationId } = req.params;

  const data = await getUsersByDesignationService(companyId, designationId);
  return sendSuccess(
    res,
    { users: data },
    'getting User data by designation successfully'
  );
};
const statusChange = async (req, res) => {
  const { companyId } = req.user;
  const { id, status } = req.query;
  const payload = req.body;

  const data = await statusChangetByIdService(companyId, id, status, payload);
  return sendSuccess(res, { user: data }, 'status change successfully');
};

const getUsersByDesignationDeleted = async (req, res) => {
  const { companyId } = req.user;
  const { deletedesignationId } = req.params;
  const data = await getDeletedUsersByDesignationService(
    companyId,
    deletedesignationId
  );
  return sendSuccess(
    res,
    { users: data },
    'getting User data by designation successfully'
  );
};
const assigneDeleteUser = async (req, res) => {
  const token = req.user;
  const payload = req.body;

  const data = await assigneDeleteUserService(token, payload);
  return sendSuccess(res, data, 'User assign  successfully');
};

const updateUser = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };

  const joiValidation = UPDATE_USER_SCHEMA.validate(
    { id, ...payload },
    options
  );

  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateUserService(id, payload, token);
  return sendSuccess(res, data, 'User updated successfully');
};

const addUser = async (req, res) => {
  const token = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_USER_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addUserService(token, payload);
  return sendSuccess(res, data, 'User added successfully');
};

const uploadUserFile = async (req, res) => {
  const token = req.user;
  const excelData = await uploadXLSX(req, res);
  const data = await uploadUserService(token, excelData);
  return sendSuccess(res, data, 'Users uploaded successfully');
};
const uploadEmployeeFile = async (req, res) => {
  const token = req.user;
  const excelData = await uploadXLSX(req, res);
  const data = await uploadEmployeeService(token, excelData);
  return sendSuccess(res, data, 'Users uploaded successfully');
};
const uploadCustomerFile = async (req, res) => {
  const token = req.user;
  const excelData = await uploadXLSX(req, res);
  const data = await uploadCustomerService(token, excelData);
  return sendSuccess(res, data, 'Customer uploaded successfully');
};

const signup = async (req, res) => {
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_USER_SINGUP_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await signupUserService(payload);
  return sendSuccess(res, data, 'User added successfully');
};
const RegisteredMda = async (req, res) => {
  const payload = req.body;
  const options = { abortEarly: false };
  const images = req.files;
  const joiValidation = INSERT_MDA_SINGUP_SCHEMA.validate(
    { images, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await signupMdaService(images, payload);
  return sendSuccess(res, data, 'Mda added successfully');
};

const deleteUser = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await deleteUserService(companyId, id);
  return sendSuccess(res, data, 'User deleted successfully');
};

const updateUserDesignation = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const payload = req.body;
  const data = await updateUserDesignationService(token, id, payload);
  return sendSuccess(res, data, 'User designation updated successfully');
};

const updatePassword = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const data = await updateUserPasswordService(id, companyId, payload);
  return sendSuccess(res, data, 'User password updated successfully');
};

export {
  getUsers,
  getUserById,
  getUsersByDesignation,
  updateUser,
  signup,
  addUser,
  deleteUser,
  uploadUserFile,
  updateUserDesignation,
  updatePassword,
  getUsersByDesignationDeleted,
  assigneDeleteUser,
  RegisteredUser,
  statusChange,
  RegisteredMda,
  getEmployee,
  uploadEmployeeFile,
  uploadCustomerFile,
};
