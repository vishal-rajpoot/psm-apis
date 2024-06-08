import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  addApprovalDao,
  deleteApprovalDao,
  deleteApprovalDesignationDao,
  getApprovalDao,
  updateApprovalDao,
} from '../../dao/featureApprovalDao';

const logger = new Logger();

const getApprovalService = async (payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    data = await getApprovalDao(conn, payload);
    return data;
  } catch (error) {
    logger.log('error while getting approval', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addApprovalService = async (payload, companyId) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const getData = await getApprovalDao(conn, companyId);

    if (getData !== undefined) {
      await deleteApprovalDao(conn, companyId);
    }
    for (const item of payload) {
      data = await addApprovalDao(conn, companyId, item);
    }
    return data;
  } catch (error) {
    logger.log('error while adding the approval', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateApprovalService = async (payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    data = await updateApprovalDao(conn, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error changing status, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteApprovalService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteApprovalDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while deleting the approval', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteApprovalDesignationService = async (companyId, designationId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteApprovalDesignationDao(
      conn,
      companyId,
      designationId
    );
    return data;
  } catch (error) {
    logger.log('error while deleting the designation approval', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getApprovalService,
  addApprovalService,
  updateApprovalService,
  deleteApprovalService,
  deleteApprovalDesignationService,
};
