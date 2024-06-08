import { sendSuccess } from '../../utils/responseHandler';
import {
  UPDATE_HIERARCHY_SCHEMA,
  UPDATE_HIERARCHY_RELATION_SCHEMA,
} from '../../schemas/hierarchySchema';
import {
  getAllDesignationsHierarchyService,
  updateDesignationHierarchyService,
  deleteDesignationHierarchyService,
  getChildDesignationService,
  getvendorDesignationAssignedEmployeeDesignationService,
  getDesignationRelationsService,
  updateDesignationHierarchyRelationService,
  getVendorsUnderEmpService,
} from './hierarchyService';

import { role_name } from '../../utils/constants';
import { ValidationError } from '../../utils/appErrors';

const getAllDesignationsHierarchy = async (req, res) => {
  const { companyId } = req.user;
  const { dept } = req.query;
  const data = await getAllDesignationsHierarchyService(companyId, dept);
  return sendSuccess(
    res,
    { designations: data },
    'getting designations hierarchy successfully'
  );
};

const updateDesignationHierarchy = async (req, res) => {
  const payload = req.body;
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_HIERARCHY_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateDesignationHierarchyService(
    payload,
    companyId,
    userId,
    id
  );
  return sendSuccess(res, data, 'Designation hierarchy updated successfully');
};

const updateDesignationHierarchyRelation = async (req, res) => {
  const payload = req.body;
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_HIERARCHY_RELATION_SCHEMA.validate(
    { id, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateDesignationHierarchyRelationService(
    payload,
    companyId,
    userId,
    id
  );
  return sendSuccess(
    res,
    data,
    'Designation hierarchy relation updated successfully'
  );
};

const deleteDesignationHierarchy = async (req, res) => {
  const id = req.params;
  const token = req.user;
  const data = await deleteDesignationHierarchyService(id, token);
  return sendSuccess(res, data, 'Designation hierarchy deleted successfully');
};

const getChildDesignation = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const { dept } = req.query;
  const data = await getChildDesignationService(id, dept, token);
  return sendSuccess(
    res,
    { designations: data },
    'getting child designation successfully'
  );
};

const getDesignationRelations = async (req, res) => {
  const { companyId } = req.user;
  const { source, destination } = req.query;
  const data = await getDesignationRelationsService(
    source,
    destination,
    companyId
  );
  return sendSuccess(
    res,
    { relation: data },
    'getting  designation relations successfully'
  );
};

const getVendorDesAssignedEmployeeDes = async (req, res) => {
  const token = req.user;
  let id;
  if (token.role_name === role_name.admin) {
    id = req.params.id;
  }
  if (token.role_name === role_name.employee) {
    id = token.designationId;
  }
  const data = await getvendorDesignationAssignedEmployeeDesignationService(
    id,
    token
  );
  return sendSuccess(
    res,
    { designations: data },
    'getting vendor designation successfully'
  );
};

const getVendorsUnderEmp = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getVendorsUnderEmpService(id, companyId);
  return sendSuccess(
    res,
    { vendors: data },
    'getting vendor designation successfully'
  );
};

export {
  getAllDesignationsHierarchy,
  updateDesignationHierarchy,
  deleteDesignationHierarchy,
  getChildDesignation,
  getVendorDesAssignedEmployeeDes,
  getDesignationRelations,
  updateDesignationHierarchyRelation,
  getVendorsUnderEmp,
};
