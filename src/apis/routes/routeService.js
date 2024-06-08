import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  addRouteDao,
  deleteRouteDao,
  getAllRoutesDao,
  getAllRoutesLmitDao,
  getRouteByIdDao,
  updateAssignEmployeeDao,
  updateRouteDao,
} from '../../dao/routeDao';
import { BadRequestError } from '../../utils/appErrors';

const logger = new Logger();

const getAllRoutesService = async (companyId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getAllRoutesLmitDao(conn, companyId, payload, offset);
    } else {
      data = await getAllRoutesDao(conn, companyId, payload);
    }
    return data;
  } catch (error) {
    logger.log('error while getting routes', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getRouteByIdService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getRouteByIdDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while getting route by id', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateAssignEmployeeService = async (companyId, payload, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const route = await getRouteByIdDao(conn, companyId, id);
    if (!route) {
      throw new BadRequestError('route not exists');
    } else {
      route[0].config.assigned_employee = payload.assigned_employee;
    }
    const data = await updateAssignEmployeeDao(
      conn,
      companyId,
      route[0].config,
      id
    );
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating route, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateRouteService = async (companyId, payload, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const route = await getRouteByIdDao(conn, companyId, id);
    if (!route) {
      throw new BadRequestError('route not exists');
    }
    const data = await updateRouteDao(conn, companyId, payload, id);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating route, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addRouteService = async (companyId, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const { vendors } = payload.config;
    for (const vendor of vendors) {
      vendor.status = 0;
    }
    const data = await addRouteDao(conn, companyId, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error adding route, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteRouteService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const route = await getRouteByIdDao(conn, companyId, id);
    if (!route) {
      throw new BadRequestError('route already deleted');
    }
    const data = await deleteRouteDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while deleting route', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllRoutesService,
  getRouteByIdService,
  updateAssignEmployeeService,
  updateRouteService,
  addRouteService,
  deleteRouteService,
};
