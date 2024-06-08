import { sendSuccess } from '../../utils/responseHandler';
import { ValidationError } from '../../utils/appErrors';
import {
  addCompanyService,
  getCompaniesService,
  getLabelingService,
  getTerritoriesService,
  getnegativeStockService,
  updateLabelingService,
  updateNegativeStockService,
  getConfigService,
} from './companyService';
import {
  INSERT_COMPANY_SCHEMA,
  UPDATE_COMPANY_SCHEMA,
  UPDATE_LABELING,
} from '../../schemas/companySchema';
import { uploadXLSX } from '../../utils/convertjson';

const getCompanies = async (req, res) => {
  const data = await getCompaniesService();
  return sendSuccess(
    res,
    { companies: data },
    'getting companies successfully'
  );
};

const getTerritories = async (req, res) => {
  const { companyId, userId } = req.user;
  const data = await getTerritoriesService(companyId, userId);
  return sendSuccess(res, { company: data }, 'getting territories successfull');
};
const getconfig = async (req, res) => {
  const { companyId } = req.user;
  const { key } = req.query;
  const payload = {
    companyId,
    key,
  };
  const data = await getConfigService(payload);
  return sendSuccess(res, { company: data }, 'getting Data successfull');
};

const getnegativeStock = async (req, res) => {
  const { companyId } = req.user;
  const data = await getnegativeStockService(companyId);
  return sendSuccess(res, data, 'getting negative stock successfully');
};

const getLabeling = async (req, res) => {
  const { companyId } = req.user;
  const data = await getLabelingService(companyId);
  return sendSuccess(res, data, 'getting labels successfully');
};

const addCompany = async (req, res) => {
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_COMPANY_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addCompanyService(payload);
  return sendSuccess(
    res,
    { company: data },
    'Verification link sent. Please check your email'
  );
};

const updateNegativeStock = async (req, res) => {
  const payload = req.body;
  const { companyId } = req.user;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_COMPANY_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateNegativeStockService(payload, companyId);
  return sendSuccess(res, data, 'negative stock updated');
};

const updateLabeling = async (req, res) => {
  const payload = req.body;
  const { companyId } = req.user;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_LABELING.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateLabelingService(payload, companyId);
  return sendSuccess(res, data, 'label updated successfully');
};

const uploadTerritoryFile = async (req, res) => {
  const excelData = await uploadXLSX(req, res);
  console.log(excelData);
  // const options = { abortEarly: false };
  // const joiValidation = INSERT_BULK_TERRITORY_SCHEMA.validate(
  //   excelData,
  //   options
  // );
  // if (joiValidation.error) {
  //   throw new ValidationError(joiValidation.error);
  // }
  // const data = await uploadTerritoryFileService(excelData, req);
  // return sendSuccess(
  //   res,
  //   { state: data },
  //   'territories bulk upload successfully'
  // );
};

export {
  getCompanies,
  getTerritories,
  getnegativeStock,
  getLabeling,
  addCompany,
  updateNegativeStock,
  updateLabeling,
  uploadTerritoryFile,
  getconfig,
};
