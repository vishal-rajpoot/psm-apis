import { sendSuccess } from '../../utils/responseHandler';
import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_UNIT_SCHEMA,
  UPDATE_UNIT_SCHEMA,
  UPDATE_UNIT_HIERARCHY_SCHEMA,
} from '../../schemas/unitSchema';
import {
  getUnitsService,
  getUnitByIdService,
  deleteUnitService,
  addUnitService,
  updateUnitService,
  updateUnitHierarchyService,
} from './unitService';

const getUnits = async (req, res) => {
  const token = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page,
    limit,
    searchText,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getUnitsService(token, payload);
  return sendSuccess(res, { units: data }, 'getting Units data successfully');
};

const getUnitById = async (req, res) => {
  const { id } = req.params;
  const token = req.user;
  const data = await getUnitByIdService(token, id);
  return sendSuccess(res, data, `getting Unit data by ${id} successfully`);
};

const updateUnitHierarchy = async (req, res) => {
  const payload = req.body;
  const token = req.user;

  const options = { abortEarly: false };
  const joiValidation = UPDATE_UNIT_HIERARCHY_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }

  const data = await updateUnitHierarchyService(payload, token);
  return sendSuccess(res, data, 'Units hierarchy updated successfully');
};

const updateUnit = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const token = req.user;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_UNIT_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateUnitService(id, payload, token);
  return sendSuccess(res, data, 'Units updated successfully');
};

const addUnit = async (req, res) => {
  const payload = req.body;
  const token = req.user;
  const options = { abortEarly: false };
  const joiValidation = INSERT_UNIT_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addUnitService(payload, token);
  return sendSuccess(res, data, 'Unit data added successfully');
};

const deleteUnit = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const data = await deleteUnitService(id, token);
  return sendSuccess(res, data, 'Unit deleted successfully');
};

export {
  getUnits,
  getUnitById,
  updateUnit,
  addUnit,
  deleteUnit,
  updateUnitHierarchy,
};
