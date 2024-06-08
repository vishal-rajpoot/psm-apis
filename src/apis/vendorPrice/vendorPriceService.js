import * as db from '../../utils/db';
import Logger from '../../utils/logger';

import {
  getPriceListDao,
  addPriceDao,
  updatePriceDao,
  deletePriceDao,
} from '../../dao/vendorPriceDao';

const logger = new Logger();

const getPriceListService = async (token, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    const data = await getPriceListDao(conn, token, payload, offset);
    return data;
  } catch (err) {
    logger.log('error while getting price list', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addPriceService = async (payload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await addPriceDao(conn, payload, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error adding price, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updatePriceService = async (payload, id, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await updatePriceDao(conn, payload, id, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating price, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deletePriceService = async (id, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await deletePriceDao(conn, id, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error deleting price, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getPriceListService,
  addPriceService,
  updatePriceService,
  deletePriceService,
};
