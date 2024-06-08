import { sendSuccess } from '../../utils/responseHandler';
import {
  INSERT_USER_ASSIGNMENT,
  UPDATE_EMPLOYEE_VENDOR_ASSIGNMENT,
  UPDATE_USER_ASSIGNMENT,
} from '../../schemas/userManagementSchema';
import { ValidationError } from '../../utils/appErrors';
import {
  getAllUnassignedUsersService,
  getAllEmployeesAssignedByManagerIdService,
  getAllVendorsAssignedByManagerIdService,
  addUserAssignmentService,
  updateUserAssignmentService,
  updateEmployeeVendorAssignmentService,
  getEmployeesByVendorIdService,
} from './userManagementService';
import { role_name } from '../../utils/constants';

const getAllUnassignedUsers = async (req, res) => {
  const token = req.user;
  const { child_designation_id, user_id, role, child } = req.query;
  const data = await getAllUnassignedUsersService(
    token,
    child_designation_id,
    user_id,
    role,
    child
  );
  return sendSuccess(
    res,
    { Unassigned_users: data },
    'getting unassigned users successfully'
  );
};

const getAllEmployeesAssignedByManagerId = async (req, res) => {
  let id;
  const token = req.user;
  if (token.role_name === role_name.admin) {
    id = req.params.id;
  }
  if (token.role_name === role_name.employee) {
    id = token.userId;
  }
  const data = await getAllEmployeesAssignedByManagerIdService(id, token);
  return sendSuccess(
    res,
    { Employees: data },
    'getting assigned employees successfully'
  );
};

const getAllVendorsAssignedByManagerId = async (req, res) => {
  let id;
  const token = req.user;
  const { designation_id, role } = req.query;
  if (token.role_name === role_name.admin) {
    id = req.params.id;
  }
  if (token.role_name === role_name.employee) {
    id = token.userId;
  }
  const data = await getAllVendorsAssignedByManagerIdService(
    id,
    token,
    designation_id,
    role
  );
  return sendSuccess(
    res,
    { Vendors: data },
    'getting assigned vendors successfully'
  );
};

const addUserAssignments = async (req, res) => {
  const payload = req.body;
  const token = req.user;
  const options = { abortEarly: false };
  const joiValidation = INSERT_USER_ASSIGNMENT.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addUserAssignmentService(payload, token);
  return sendSuccess(res, data, 'User assignment added successfully');
};

const updateUserAssignment = async (req, res) => {
  const payload = req.body;
  const { id } = req.params;
  const token = req.user;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_USER_ASSIGNMENT.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateUserAssignmentService(id, payload, token);
  return sendSuccess(res, data, 'User Assignment updated successfully');
};

const updateEmployeeVendorAssignment = async (req, res) => {
  const payload = req.body;
  const { id } = req.params;
  const token = req.user;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_EMPLOYEE_VENDOR_ASSIGNMENT.validate(
    payload,
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateEmployeeVendorAssignmentService(id, payload, token);
  return sendSuccess(
    res,
    data,
    'Employee Vendor Assignment updated successfully'
  );
};

const getEmployeesByVendorId = async (req, res) => {
  const { id } = req.params;
  const token = req.user;
  const payload = {
    id,
    token,
  };
  const data = await getEmployeesByVendorIdService(payload);
  return sendSuccess(
    res,
    { Employees: data },
    'getting employees successfully'
  );
};

export {
  getAllUnassignedUsers,
  getAllEmployeesAssignedByManagerId,
  getAllVendorsAssignedByManagerId,
  addUserAssignments,
  updateUserAssignment,
  updateEmployeeVendorAssignment,
  getEmployeesByVendorId,
};
