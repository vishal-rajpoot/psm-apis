import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { sendPushNotification } from '../../middlewares/pushNotifications';

import {
  addPushNotificationDao,
  getFcmTokenDao,
  getNotificationsDao,
  addNotificationTimeDao,
  deleteHolidaysDao,
  addHolidaysDao,
  getHolidaysDao,
} from '../../dao/notificationsDao';

const logger = new Logger();

const getNotificationService = async (token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getNotificationsDao(conn, token);
    return data;
  } catch (err) {
    logger.log('error while getting notifications', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};
const getHolidaysService = async (companyId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getHolidaysDao(conn, companyId);
    return data;
  } catch (err) {
    logger.log('error while getting Holidays', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addHolidaysNotificationService = async (companyId, payload) => {
  let conn;
  try {
    let data;

    conn = await db.fetchConn();
    if (payload.notificationTime) {
      const { notificationTime } = payload;
      data = await addNotificationTimeDao(conn, companyId, notificationTime);
    }
    if (payload.holidays) {
      const { holidays } = payload;
      data = await addHolidaysDao(conn, companyId, holidays);
    }
    return data;
  } catch (err) {
    logger.log('error while Adding Holidays ', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const pushNotificationService = async (title, body, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const fcmTokenData = await getFcmTokenDao(conn, token);
    if (fcmTokenData !== undefined) {
      await sendPushNotification(fcmTokenData.fcmToken, title, body);
    }

    await conn.beginTransaction();
    const data = await addPushNotificationDao(conn, title, body, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error adding notification, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteHolidaysNotificationService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteHolidaysDao(conn, companyId, id);
    return data;
  } catch (err) {
    logger.log('error while deleting', 'error', err);
  } finally {
    if (conn) conn.end();
  }
};

export {
  getNotificationService,
  pushNotificationService,
  addHolidaysNotificationService,
  deleteHolidaysNotificationService,
  getHolidaysService,
};
