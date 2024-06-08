import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  addLeadActivitiesDao,
  getAllLeadActivitiesByIdDao,
  updateLeadStatusDao,
  getLeadActivitiesByUserDao,
  updateOrderStatusLeadActivitiesDao,
  getLeadActivitiesByIdDao,
  updateProductQtyDao,
} from '../../dao/leadActivitiesDao';
import { getEmployeeByLeadsIdDao } from '../../dao/leadsDao';
import { confirmOrderDao } from '../../dao/userActivitiesDao';
import { getAllProductsDao } from '../../dao/productsDao';
import { approveLeadService } from '../leads/leadsService';

const logger = new Logger();

const addLeadActivitiesService = async (token, lead, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await addLeadActivitiesDao(conn, token, lead, payload);
    await updateLeadStatusDao(conn, token, lead);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error adding lead activities, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getAllLeadActivitiesByIdService = async (
  lead,
  token,
  event_type,
  payload
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    const data = await getAllLeadActivitiesByIdDao(
      conn,
      lead,
      token,
      event_type,
      payload,
      offset
    );
    return data;
  } catch (err) {
    logger.log('error while getting lead activities', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getLeadActivitiesByUserService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    const data = await getLeadActivitiesByUserDao(conn, payload, offset);
    return data;
  } catch (err) {
    logger.log('error while getting lead activities', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const updateOrderStatusLeadActivitiesService = async (payload, role) => {
  let conn;
  try {
    conn = await db.fetchConn();

    const data = await updateOrderStatusLeadActivitiesDao(conn, payload);
    const order = await getLeadActivitiesByIdDao(conn, payload);
    const leadId = order[0]?.lead_id;
    const data2 = await getEmployeeByLeadsIdDao(conn, leadId, payload.token);
    let month;
    if (order[0].month < 10) month = `0${order[0].month}`;
    const orderData = {
      user: data2?.user,
      month,
      year: order[0]?.year,
      amount: order[0]?.config.gross_total,
      token: payload.token,
    };
    await confirmOrderDao(conn, orderData);
    const getProduct = await getAllProductsDao(conn, payload);
    for (const item of order[0].config.products) {
      for (const product of getProduct.products) {
        if (item.product_id === product.id) {
          const productData = {
            quantity: item.quantity,
            product_id: item.product_id,
          };
          await updateProductQtyDao(conn, payload.token, productData);
        }
      }
    }

    // approve lead also
    await approveLeadService(leadId, payload.token, role);

    await conn.commit();
    return data;
  } catch (err) {
    logger.log(
      'error while changing lead order status lead activities',
      'error',
      err
    );
    await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  addLeadActivitiesService,
  getAllLeadActivitiesByIdService,
  getLeadActivitiesByUserService,
  updateOrderStatusLeadActivitiesService,
};
