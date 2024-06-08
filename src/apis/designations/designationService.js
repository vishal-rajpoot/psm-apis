import {
  getAllDesignationsHierarchyDao,
  getChildDesignationDao,
  updateDesignationHierarchyDao,
} from '../../dao/hierarchyDao';
import { getRoleByIdDao } from '../../dao/rolesDao';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { addApprovalDao } from '../../dao/featureApprovalDao';
import {
  addDesignationHierarchyService,
  updateDesignationHierarchyService,
} from '../hierarchies/hierarchyService';

import {
  getDesignationsDao,
  getDesignationsLimitDao,
  getDesignationByIdDao,
  deleteDesignationDao,
  addDesignationDao,
  updateDesignationDao,
  getDesignationsByRoleIdDao,
} from '../../dao/designationDao';
import { BadRequestError, DuplicateDataError } from '../../utils/appErrors';
import { deleteApprovalDesignationService } from '../featureApproval/featureApprovalService';
import { ROLE_TYPE } from '../../utils/constants';

const logger = new Logger();

const getDesignationsService = async (companyId, payload) => {
  let conn;
  let data;
  const designation = [];
  try {
    conn = await db.fetchConn();
    const token = {
      companyId,
    };
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getDesignationsLimitDao(conn, companyId, payload, offset);
    } else if (
      payload.dept &&
      (payload.dept === ROLE_TYPE.EMPLOYEE || ROLE_TYPE.VENDOR)
    ) {
      const designationIds = await getChildDesignationDao(
        conn,
        payload.dept,
        token
      );
      const ids = JSON.parse(designationIds[0]?.ids);
      for (const id of ids) {
        const designationById = await getDesignationByIdDao(
          conn,
          companyId,
          id
        );
        designation.push(designationById);
      }
      const designations = {
        designation,
      };
      return designations;
    } else {
      data = await getDesignationsDao(conn, companyId);
    }

    return data;
  } catch (error) {
    logger.log('error while getting designations', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getDesignationByIdService = async (companyId, designationId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getDesignationByIdDao(conn, companyId, designationId);
    return data;
  } catch (error) {
    logger.log(
      `error while getting designation  by ${designationId} id`,
      'error',
      error
    );
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateDesignationService = async (companyId, designationId, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await updateDesignationDao(
      conn,
      companyId,
      designationId,
      payload
    );
    return data;
  } catch (error) {
    logger.log('error while updating designation', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addDesignationService = async (companyId, userId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const allDesignations = await getDesignationsDao(conn, companyId);
    if (allDesignations) {
      for (const designation of allDesignations.designation) {
        if (designation.designation === payload.designation) {
          throw new DuplicateDataError('Designation Already Exists');
        }
      }
    }
    data = await addDesignationDao(conn, companyId, payload);

    const roles = await getRoleByIdDao(conn, companyId, payload.role_id);
    if (roles[0].role === 'vendor') {
      const autoApprovalobj = {
        designation_id: data.id,
        designation: payload.designation,
        config: [
          {
            feature: 'Order Approval',
            status: 'Inactive',
          },
          {
            feature: 'Lead Approval',
            status: 'Inactive',
          },
        ],
      };
      await addApprovalDao(conn, companyId, autoApprovalobj);
    }

    const roleName = roles[0].role.toLowerCase();
    const hierarchy = await getAllDesignationsHierarchyDao(conn, companyId);
    let modifiedConfig;
    if (hierarchy === undefined) {
      // will create a new hierarchy object with the roleName
      modifiedConfig = { [roleName]: { [data.id]: 1 } };
      await addDesignationHierarchyService(modifiedConfig, companyId, userId);
    } else {
      modifiedConfig = hierarchy[0].config;
      if (!modifiedConfig[roleName]) {
        // will create a new object for the roleName
        modifiedConfig[roleName] = { [data.id]: 1 };
      }
      const designations = modifiedConfig[roleName];
      const { length } = Object.keys(designations);

      if (!designations[data.id]) {
        designations[data.id] = length + 1;
      }
      await updateDesignationHierarchyDao(
        conn,
        modifiedConfig,
        companyId,
        userId,
        hierarchy[0].id
      );
    }

    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding designation', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteDesignationService = async (companyId, userId, designationId) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const designationHierarchy = await getAllDesignationsHierarchyDao(
      conn,
      companyId
    );
    const designation = await getDesignationByIdDao(
      conn,
      companyId,
      designationId
    );
    const { employee, vendor, relations } = designationHierarchy[0].config;
    if (
      (employee?.hasOwnProperty(designationId) ||
        vendor?.hasOwnProperty(designationId)) &&
      designation
    ) {
      if (relations) {
        for (const item of relations) {
          const obj = item?.config;

          const keyPresent = Object.keys(obj).includes(designationId);
          const valuePresent = Object.values(obj)
            .flat()
            .includes(designationId);
          if (keyPresent || valuePresent) {
            throw new BadRequestError(
              'Designation is in use !!! Cannot delete'
            );
          }
        }
      }
      if (employee && employee[designationId]) {
        delete employee[designationId];
        const keys = Object.keys(employee);
        keys?.forEach((key, index) => {
          employee[key] = index + 1;
        });
        await updateDesignationHierarchyService(
          designationHierarchy[0].config,
          companyId,
          userId,
          designationHierarchy[0].id
        );
      }
      if (vendor && vendor[designationId]) {
        delete vendor[designationId];
        const keys = Object.keys(vendor);
        keys?.forEach((key, index) => {
          vendor[key] = index + 1;
        });
        await updateDesignationHierarchyService(
          designationHierarchy[0].config,
          companyId,
          userId,
          designationHierarchy[0].id
        );
        await deleteApprovalDesignationService(companyId, designationId);
      }
      data = await deleteDesignationDao(conn, companyId, designationId);
    } else {
      throw new BadRequestError('Designation not exists');
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while deleting designation', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getDesignationsByRoleIdService = async (token, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getDesignationsByRoleIdDao(conn, token, id);
    return data;
  } catch (error) {
    logger.log('error while getting designations ', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addDesignationPriorityService = async (companyId, userId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const allDesignations = await getDesignationsDao(conn, companyId);

    for (const payloadDesignation of payload) {
      // Check if the payload designation already exists
      const designationExists = allDesignations?.designation.some(
        (designation) =>
          designation.designation === payloadDesignation.designation
      );

      if (designationExists) {
        throw new DuplicateDataError('Designation Already Exists');
      }

      data = await addDesignationDao(conn, companyId, payloadDesignation);
      const roles = await getRoleByIdDao(
        conn,
        companyId,
        payloadDesignation.role_id
      );

      if (roles[0].role === 'vendor') {
        const autoApprovalobj = {
          designation_id: data.id,
          designation: payloadDesignation.designation,
          config: [
            {
              feature: 'Order Approval',
              status: 'Inactive',
            },
            {
              feature: 'Lead Approval',
              status: 'Inactive',
            },
          ],
        };
        await addApprovalDao(conn, companyId, autoApprovalobj);
      }
      const roleName = roles[0].role.toLowerCase();
      const hierarchy = await getAllDesignationsHierarchyDao(conn, companyId);
      let modifiedConfig;
      if (hierarchy === undefined) {
        // will create a new hierarchy object with the roleName
        modifiedConfig = { [roleName]: { [data.id]: 1 } };
        await addDesignationHierarchyService(modifiedConfig, companyId, userId);
      } else {
        modifiedConfig = hierarchy[0].config;
        if (!modifiedConfig[roleName]) {
          // will create a new object for the roleName
          modifiedConfig[roleName] = { [data.id]: 1 };
        }
        const designations = modifiedConfig[roleName];
        const { length } = Object.keys(designations);
        if (!designations[data.id]) {
          designations[data.id] = length + 1;
        }
        await updateDesignationHierarchyDao(
          conn,
          modifiedConfig,
          companyId,
          userId,
          hierarchy[0].id
        );
      }
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding designation', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getDesignationsService,
  getDesignationByIdService,
  updateDesignationService,
  addDesignationService,
  deleteDesignationService,
  getDesignationsByRoleIdService,
  addDesignationPriorityService,
};
