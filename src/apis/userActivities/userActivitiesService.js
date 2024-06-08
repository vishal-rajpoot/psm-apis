import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { APPROVED, role_name } from '../../utils/constants';

import {
  getUserActivitiesDao,
  discussionOrReminderByIdDao,
  getUserActivitiesFilterDao,
  getUserActivitiesByIdDao,
  updateUserActivitiesDao,
  deleteUserActivitiesDao,
  getOrderByStatusDao,
  getOrderListDao,
  changeOrderStatusDao,
  confirmOrderDao,
  getVendorOrderByIdDao,
  reminderCronJobDao,
  getVendorCompetitorStockByIdDao,
  getVendorOwnStockByIdDao,
} from '../../dao/userActivitiesDao';
import {
  fetchEmployeeHierarchy,
  fetchDesignationRole,
  fetchVendorHierarchy,
  fetchRole,
} from '../../dao/userDao';
import { updateOrderStatusLeadActivitiesDao } from '../../dao/leadActivitiesDao';
import { updateOrderStatusLeadActivitiesService } from '../lead-activities/leadActivitiesService';
import { vendorByEmployeeIdDao } from '../../dao/userManagementDao';
import { updateInventoryService } from '../inventoryManagement/inventoryService';
import { pushNotificationService } from '../notifications/notificationService';
import { getRoleByNameDao } from '../../dao/rolesDao';

const logger = new Logger();

const getVendorOrderByIdService = async (companyId, id, startDate, endDate) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    data = await getVendorOrderByIdDao(conn, companyId, id, startDate, endDate);
    return data;
  } catch (error) {
    logger.log('error while getting activities', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const getVendorCompetitorStockService = async (companyId, id) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    data = await getVendorCompetitorStockByIdDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while getting activities', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const getVendorOwnStockService = async (companyId, id) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    data = await getVendorOwnStockByIdDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while getting activities', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getUserActivitiesService = async (payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    if (payload.startDate === undefined || payload.endDate === undefined) {
      const offset =
        parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
      data = await getUserActivitiesDao(conn, payload, offset);
    } else {
      const offset =
        parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
      data = await getUserActivitiesFilterDao(conn, payload, offset);
    }
    return data;
  } catch (error) {
    logger.log('error while getting activities', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getOrderByStatusService = async (
  payload,
  userId,
  designationId,
  roleId
) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    let status = false;
    const checkDesignation = await fetchDesignationRole(
      conn,
      payload.companyId,
      designationId
    );
    let lowerLevelId = [];
    if (checkDesignation && checkDesignation.designation === 'admin') {
      status = true;
    } else {
      const rolesforlist = await fetchRole(conn, payload.companyId, roleId);
      if (rolesforlist && rolesforlist.role === 'employee') {
        lowerLevelId = await fetchEmployeeHierarchy(
          conn,
          userId,
          payload.companyId
        );
      } else {
        lowerLevelId = await fetchVendorHierarchy(
          conn,
          userId,
          payload.companyId
        );
      }
    }
    if (payload.startDate !== undefined && payload.endDate !== undefined) {
      const offset =
        parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
      if (payload.status) {
        data = await getOrderByStatusDao(
          conn,
          payload,
          offset,
          status,
          lowerLevelId
        );
      } else {
        data = await getOrderListDao(
          conn,
          payload,
          offset,
          status,
          lowerLevelId
        );
      }
    }
    return data;
  } catch (error) {
    logger.log('error while getting order by status', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getUserActivitiesByIdService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getUserActivitiesByIdDao(conn, payload);
    return data;
  } catch (error) {
    logger.log('error while getting order by Id', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateUserActivitiesService = async (companyId, id, config) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await updateUserActivitiesDao(conn, companyId, id, config);
    return data;
  } catch (error) {
    logger.log('error while updating UserActivities', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteUserActivitiesService = async (companyId, orderId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteUserActivitiesDao(conn, companyId, orderId);
    return data;
  } catch (error) {
    logger.log('error while deleting the UserActivities', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const confirmOrderStatusService = async (payload) => {
  let conn;
  try {
    const body = {
      token: payload.token,
      id: payload.id,
      status: APPROVED,
    };

    conn = await db.fetchConn();
    await conn.beginTransaction();
    await changeOrderStatusDao(conn, body);
    const order = await getUserActivitiesByIdDao(conn, body);
    const employeePayload = {
      id: order[0].config.buyer_id,
      token: payload.token,
    };
    let month;
    if (order[0].month < 10) month = `0${order[0].month}`;

    if (payload.token.role_name === 'employee') {
      const allVendors = [];
      const vendorList = await vendorByEmployeeIdDao(conn, employeePayload);
      const size = vendorList.vendors.length;
      if (size > 0) {
        for (const outsideItem of vendorList.vendors) {
          for (const insideItem of outsideItem.vendors) {
            allVendors.push(insideItem);
          }
        }
      }

      for (const item of allVendors) {
        if (item === order[0].config.buyer_id) {
          const orderData = {
            user: item,
            month,
            year: order[0].year,
            amount: order[0].config.gross_total,
            token: payload.token,
          };

          const confirmOrder = await confirmOrderDao(conn, orderData);

          const updateQuantity = {
            vendor_id: order[0].config.buyer_id,
            token: payload.token,
            body: order[0].config.products,
          };
          await updateInventoryService(updateQuantity);
          const confirm = confirmOrder.affectedRows;
          await conn.commit();
          return confirm;
        }
      }
    }

    if (payload.token.role_name === 'admin') {
      const orderData = {
        user: order[0].config.buyer_id,
        month,
        year: order[0].year,
        amount: order[0].config.gross_total,
        token: payload.token,
      };
      const confirmOrder = await confirmOrderDao(conn, orderData);

      const updateQuantity = {
        vendor_id: order[0].config.buyer_id,
        token: payload.token,
        body: order[0].config.products,
      };
      await updateInventoryService(updateQuantity);
      const confirm = confirmOrder.affectedRows;

      await conn.commit();
      return confirm;
    }
  } catch (error) {
    logger.log('error confirming order , reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const changeOrderStatusService = async (payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    if (payload.event_type === 'order') {
      if (payload.status === APPROVED) {
        data = await confirmOrderStatusService(payload);
      } else {
        data = await changeOrderStatusDao(conn, payload);
      }
    } else if (payload.status === APPROVED) {
      const role = await getRoleByNameDao(
        conn,
        payload.token,
        role_name.vendor
      );
      data = await updateOrderStatusLeadActivitiesService(payload, role.id);
    } else {
      data = await updateOrderStatusLeadActivitiesDao(conn, payload);
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error changing order status, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const discussionOrReminderByIdService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    const data = await discussionOrReminderByIdDao(conn, payload, offset);
    return data;
  } catch (error) {
    logger.log('error while discussion UserActivities', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const reminderCronJobService = async (dateformat) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await reminderCronJobDao(conn, dateformat);
    if (data !== undefined) {
      for (const key of data) {
        const token = {
          userId: key.user,
          companyId: key.company,
        };
        const title = key.config.followup_title;
        const body = key.config.followup_description;
        await pushNotificationService(title, body, token);
      }
    }

    return data;
  } catch (error) {
    logger.log('error while reminder cron job is running', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getUserActivitiesService,
  discussionOrReminderByIdService,
  getOrderByStatusService,
  getUserActivitiesByIdService,
  updateUserActivitiesService,
  deleteUserActivitiesService,
  changeOrderStatusService,
  confirmOrderStatusService,
  reminderCronJobService,
  getVendorOrderByIdService,
  getVendorCompetitorStockService,
  getVendorOwnStockService,
};
