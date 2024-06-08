import { sendSuccess } from '../../utils/responseHandler';
import { uploadXLSX } from '../../utils/convertjson';
import {
  INSERT_LEAD_SCHEMA,
  UPDATE_LEAD_SCHEMA,
  INSERT_BULK_LEAD_SCHEMA,
} from '../../schemas/leadSchema';
import { ValidationError } from '../../utils/appErrors';
import {
  getAllLeadsService,
  getLeadByIdService,
  addLeadService,
  updateLeadService,
  deleteLeadService,
  getEmployeeLeadsService,
  transferLeadService,
  updatetransferLeadService,
  getLeadsByStatusService,
  rejectLeadService,
  approveLeadService,
  uploadLeadService,
} from './leadsService';

const getAllLeads = async (req, res) => {
  const { companyId } = req.user;
  const { page, limit, sort, column, searchText } = req.query;
  const payload = {
    page,
    limit,
    searchText,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getAllLeadsService(companyId, payload);
  return sendSuccess(res, { leads: data }, 'getting leads data successfully');
};

const getLeadById = async (req, res) => {
  const data = await getLeadByIdService(req);
  return sendSuccess(res, { leads: data }, 'getting lead data successfully');
};

const addLead = async (req, res) => {
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_LEAD_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }

  const data = await addLeadService(req);
  return sendSuccess(res, data, 'Lead added successfully');
};

const updateLead = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_LEAD_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateLeadService(req);
  return sendSuccess(res, data, 'Lead updated successfully');
};

const deleteLead = async (req, res) => {
  const data = await deleteLeadService(req);
  return sendSuccess(res, { leads: data }, 'Lead deleted successfully');
};

const getEmployeeLeads = async (req, res) => {
  const { userId, companyId } = req.user;
  const { id } = req.params;
  let user = id;
  if (user === undefined) {
    user = userId;
  }
  const data = await getEmployeeLeadsService(user, companyId);
  return sendSuccess(
    res,
    { leads: data },
    'getting employee leads successfully'
  );
};

const transferLead = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const token = req.user;
  const data = await transferLeadService(id, payload, token);
  return sendSuccess(res, data, 'Lead transferred successfully');
};
const updatetransferLead = async (req, res) => {
  const payload = req.body;
  const token = req.user;
  const data = await updatetransferLeadService(payload, token);
  return sendSuccess(res, data, 'Lead transferred successfully');
};

const getLeadsByStatus = async (req, res) => {
  const { companyId, userId, designationId, roleId } = req.user;
  const { status, page, limit, sort, column, searchText } = req.query;
  const payload = {
    status,
    page,
    limit,
    searchText,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getLeadsByStatusService(
    companyId,
    payload,
    userId,
    designationId,
    roleId
  );
  return sendSuccess(res, { leads: data }, 'getting leads data successfully');
};

const rejectLead = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const token = req.user;
  const data = await rejectLeadService(id, payload, token);
  return sendSuccess(res, data, 'Lead rejected successfully');
};

const approveLead = async (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body; // vendor role id
  const token = req.user;
  const data = await approveLeadService(id, token, role_id);
  return sendSuccess(res, data, 'Lead approved successfully');
};

const uploadLeadFile = async (req, res) => {
  const excelData = await uploadXLSX(req, res);

  const options = { abortEarly: false };
  const joiValidation = INSERT_BULK_LEAD_SCHEMA.validate(excelData, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }

  const data = await uploadLeadService(excelData, req);
  return sendSuccess(res, { leads: data }, 'Lead bulk upload successfully');
};

export {
  uploadLeadFile,
  getAllLeads,
  getLeadById,
  addLead,
  updateLead,
  deleteLead,
  getEmployeeLeads,
  transferLead,
  updatetransferLead,
  getLeadsByStatus,
  rejectLead,
  approveLead,
};
