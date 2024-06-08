import { sendSuccess } from '../../utils/responseHandler';
import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_PACKAGE_SCHEMA,
  UPDATE_PACKAGE_SCHEMA,
  UPDATE_PACKAGE_STATUS_SCHEMA,
} from '../../schemas/packageSchema';
import {
  getAllPackagesService,
  getPackageByIdService,
  addPackageService,
  updatePackageService,
  deletePackageService,
  updatePackageStatusService,
} from './packagesService';

const getAllPackages = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page,
    limit,
    searchText,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getAllPackagesService(companyId, payload);
  return sendSuccess(
    res,
    { packages: data },
    'getting packages data successfully'
  );
};

const getPackageById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;

  const data = await getPackageByIdService(companyId, id);
  return sendSuccess(res, data, 'getting package successfully');
};

const addPackage = async (req, res) => {
  const { companyId, userId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_PACKAGE_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addPackageService(companyId, userId, payload);
  return sendSuccess(res, data, 'package added successfully');
};

const updatePackage = async (req, res) => {
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_PACKAGE_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updatePackageService(id, companyId, userId, payload);
  return sendSuccess(res, { package: data }, 'package updated successfully');
};

const updatePackageStatus = async (req, res) => {
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_PACKAGE_STATUS_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updatePackageStatusService(id, companyId, userId, payload);
  return sendSuccess(res, { package: data }, 'package updated successfully');
};

const deletePackage = async (req, res) => {
  const { companyId, userId } = req.user;
  const { id } = req.params;

  const data = await deletePackageService(id, companyId, userId);
  return sendSuccess(res, { package: data }, 'package deleted successfully');
};

export {
  getAllPackages,
  getPackageById,
  addPackage,
  updatePackage,
  updatePackageStatus,
  deletePackage,
};
