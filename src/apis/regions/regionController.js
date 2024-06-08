import { sendSuccess } from '../../utils/responseHandler';
import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_REGION_SCHEMA,
  UPDATE_REGION_SCHEMA,
} from '../../schemas/regionSchema';

import {
  getRegionsService,
  getRegionByIdService,
  deleteRegionService,
  addRegionService,
  updateRegionService,
} from './regionService';

const getRegions = async (req, res) => {
  const token = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page,
    limit,
    searchText,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getRegionsService(token, payload);
  return sendSuccess(
    res,
    { Regions: data },
    'getting Regions data successfully'
  );
};

const getRegionById = async (req, res) => {
  const { id } = req.params;
  const token = req.user;
  const data = await getRegionByIdService(token, id);
  return sendSuccess(res, data, `getting Region data by ${id} successfully`);
};

const updateRegion = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const token = req.user;

  const options = { abortEarly: false };
  const joiValidation = UPDATE_REGION_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateRegionService(id, payload, token);
  return sendSuccess(res, data, 'Regions updated successfully');
};

const addRegion = async (req, res) => {
  const payload = req.body;
  const token = req.user;
  const options = { abortEarly: false };
  const joiValidation = INSERT_REGION_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addRegionService(payload, token);
  return sendSuccess(res, { region: data }, 'Region data added successfully');
};

const deleteRegion = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const data = await deleteRegionService(id, token);
  return sendSuccess(res, data, 'Region deleted successfully');
};

export { getRegions, getRegionById, updateRegion, addRegion, deleteRegion };
