import * as db from '../../utils/db';
import Logger from '../../utils/logger';

import {
  getRolesDao,
  getRoleByIdDao,
  addRoleDao,
  updateRoleDao,
  deleteRoleDao,
  getRoleByNameDao,
} from '../../dao/rolesDao';
import { DuplicateDataError } from '../../utils/appErrors';
import { VALIDATION_MESSAGES } from '../../utils/constants';

const logger = new Logger();

const getRolesService = async (token, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    const data = await getRolesDao(conn, token, payload, offset);
    return data;
  } catch (error) {
    logger.log('error while getting roles', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getRoleByIdService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getRoleByIdDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while getting role  by id', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateRoleService = async (token, payload, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkRoleName = await getRoleByNameDao(conn, token, payload.role);
    if (checkRoleName !== undefined && checkRoleName.id !== id) {
      throw new DuplicateDataError(`Role ${VALIDATION_MESSAGES.DUPLICATE}`);
    }
    await conn.beginTransaction();
    const data = await updateRoleDao(conn, token, payload, id);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating role, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addRoleService = async (token, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkRoleName = await getRoleByNameDao(conn, token, payload.role);
    if (checkRoleName !== undefined) {
      throw new DuplicateDataError(`Role ${VALIDATION_MESSAGES.DUPLICATE}`);
    }
    await conn.beginTransaction();
    const data = await addRoleDao(conn, token, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error adding role, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteRoleService = async (token, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteRoleDao(conn, token, id);
    return data;
  } catch (error) {
    logger.log('error while deleting role', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getRolesService,
  getRoleByIdService,
  updateRoleService,
  addRoleService,
  deleteRoleService,
};
