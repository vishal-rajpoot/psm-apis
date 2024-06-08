import * as db from '../../utils/db';
import Logger from '../../utils/logger';

import {
  getAllDesignationsHierarchyDao,
  addDesignationHierarchyDao,
  updateDesignationHierarchyDao,
  deleteDesignationHierarchyDao,
  getChildDesignationDao,
  getDesignationNameDao,
  getVendorDesignationAssociatedWithEmployeeDesignation,
  getDesignationRelationsDao,
  getAllDesignationsHierarchyByDeptDao,
  getVendorsUnderEmpDao,
} from '../../dao/hierarchyDao';
import { getUsersByDesignationDao } from '../../dao/userDao';
import { BadRequestError } from '../../utils/appErrors';

const logger = new Logger();

const getAllDesignationsHierarchyService = async (companyId, dept) => {
  let conn;
  try {
    conn = await db.fetchConn();
    if (dept !== undefined) {
      const data = await getAllDesignationsHierarchyByDeptDao(
        conn,
        companyId,
        dept
      );
      return data;
    }
    const data = await getAllDesignationsHierarchyDao(conn, companyId);
    return data;

    // return data;
  } catch (err) {
    logger.log('error while getting designations hierarchy', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addDesignationHierarchyService = async (payload, companyId, userId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await addDesignationHierarchyDao(
      conn,
      payload,
      companyId,
      userId
    );
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error adding designation hierarchy, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateDesignationHierarchyService = async (
  config,
  companyId,
  userId,
  id
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const hierarchy = await getAllDesignationsHierarchyDao(conn, companyId);
    const existingConfig = hierarchy[0].config;
    for (const key in config) {
      if (existingConfig.hasOwnProperty(key)) {
        existingConfig[key] = config[key];
      } else {
        existingConfig[key] = config[key];
      }
    }
    const data = await updateDesignationHierarchyDao(
      conn,
      existingConfig,
      companyId,
      userId,
      id
    );
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error updating designation hierarchy, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateDesignationHierarchyRelationService = async (
  config,
  companyId,
  userId
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const hierarchy = await getAllDesignationsHierarchyDao(conn, companyId);
    const newId = hierarchy[0].id;
    const existingConfig = hierarchy[0].config;

    let { relations } = existingConfig;
    if (!relations) {
      relations = [];
      existingConfig.relations = relations;
    }

    let foundMatch = false;
    const updatedRelations = relations.map((relation) => {
      if (
        relation.source === config.source &&
        relation.destination === config.destination
      ) {
        foundMatch = true;
        return {
          source: config.source,
          destination: config.destination,
          config: config.config,
        };
      }
      return relation;
    });
    if (!foundMatch) {
      const newRelation = {
        source: config.source,
        destination: config.destination,
        config: config.config,
      };
      updatedRelations.push(newRelation);
    }
    existingConfig.relations = updatedRelations;
    const data = await updateDesignationHierarchyDao(
      conn,
      existingConfig,
      companyId,
      userId,
      newId
    );
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error updating designation hierarchy relations, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteDesignationHierarchyService = async (id, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await deleteDesignationHierarchyDao(conn, id, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error deleting designation hierarchy, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getChildDesignationService = async (id, dept, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getChildDesignationDao(conn, dept, token);
    const obj = JSON.parse(data[0].ids);
    const checkValue = id;
    const index = obj.indexOf(checkValue);
    if (index === -1 || index === obj.length - 1) {
      return [];
    }
    const nextValue = obj[index + 1];
    const designation = await getDesignationNameDao(conn, nextValue, token);
    return designation;
  } catch (err) {
    logger.log('error while getting child designations', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getDesignationRelationsService = async (
  source,
  destination,
  companyId
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getDesignationRelationsDao(
      conn,
      source,
      destination,
      companyId
    );
    if (!data) {
      const dataId = await getAllDesignationsHierarchyDao(conn, companyId);
      const id = {
        id: dataId[0].id,
      };
      return id;
    }
    return data;
  } catch (err) {
    logger.log('error while getting designation relations', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getvendorDesignationAssignedEmployeeDesignationService = async (
  id,
  token
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const designation =
      await getVendorDesignationAssociatedWithEmployeeDesignation(
        conn,
        id,
        token
      );
    if (!designation) {
      throw new BadRequestError('relation not found');
    }
    return designation;
  } catch (err) {
    logger.log('error while getting vendor designations', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getVendorsUnderEmpService = async (id, companyId) => {
  let conn;
  const allVendors = [];
  try {
    conn = await db.fetchConn();
    const vendorDesignations = await getVendorsUnderEmpDao(conn, id, companyId);
    const designations = vendorDesignations?.vendor_designations[0];
    if (!designations) {
      throw new BadRequestError('relation not found');
    }
    // eslint-disable-next-line no-unreachable-loop
    for (const designation of designations) {
      const getVendors = await getUsersByDesignationDao(
        conn,
        companyId,
        designation
      );
      if (getVendors) {
        // eslint-disable-next-line array-callback-return
        getVendors.map((vendor) => {
          allVendors.push(vendor);
        });
      }
    }
    return allVendors;
  } catch (err) {
    logger.log(
      'error while getting vendors assigned to employees',
      'error',
      err
    );
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllDesignationsHierarchyService,
  addDesignationHierarchyService,
  updateDesignationHierarchyService,
  deleteDesignationHierarchyService,
  getChildDesignationService,
  getvendorDesignationAssignedEmployeeDesignationService,
  getDesignationRelationsService,
  updateDesignationHierarchyRelationService,
  getVendorsUnderEmpService,
};
