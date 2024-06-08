import {
  INSERT_ROUTE_SCHEMA,
  UPDATE_EMPLOYEE_SCHEMA,
  UPDATE_ROUTE_SCHEMA,
} from '../../schemas/routeSchema';
import { ValidationError } from '../../utils/appErrors';
import {
  addRouteService,
  deleteRouteService,
  getAllRoutesService,
  getRouteByIdService,
  updateAssignEmployeeService,
  updateRouteService,
} from './routeService';
import { sendSuccess } from '../../utils/responseHandler';

const getAllRoutes = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page,
    limit,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
  };
  const data = await getAllRoutesService(companyId, payload);
  return sendSuccess(res, { Routes: data }, 'getting routes data successfully');
};

const getRouteById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getRouteByIdService(companyId, id);
  return sendSuccess(res, data, 'getting route data successfully');
};

const updateAssignEmployee = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_EMPLOYEE_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateAssignEmployeeService(companyId, payload, id);
  return sendSuccess(res, data, 'employee assigned successfully');
};

const updateRoute = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_ROUTE_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateRouteService(companyId, payload, id);
  return sendSuccess(res, data, 'route updated successfully');
};

const addRoute = async (req, res) => {
  const { companyId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_ROUTE_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addRouteService(companyId, payload);
  return sendSuccess(res, data, 'route data added successfully');
};

const deleteRoute = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await deleteRouteService(companyId, id);
  return sendSuccess(res, data, 'route deleted successfully');
};

export {
  getAllRoutes,
  getRouteById,
  updateAssignEmployee,
  updateRoute,
  addRoute,
  deleteRoute,
};
