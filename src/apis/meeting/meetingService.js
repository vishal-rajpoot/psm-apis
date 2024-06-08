import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { EVENT_TYPE } from '../../utils/constants';
import {
  getMettingServiceDao,
  getMeetingByIdDao,
  addMeetingDao,
  getExecuteMettingServiceDao,
  getScheduleMettingServiceDao,
  getListMettingServiceDao,
} from '../../dao/meetingDao';

const logger = new Logger();

const getMettingService = async (token, date) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getMettingServiceDao(conn, token, date);
    return data;
  } catch (err) {
    logger.log('error while getting meetinglist', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};
const getExecuteMettingService = async (token, date) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getExecuteMettingServiceDao(conn, token, date);
    return data;
  } catch (err) {
    logger.log('error while getting meetinglist', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};
const getScheduleListMettingService = async (token, date) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getScheduleMettingServiceDao(conn, token, date);
    return data;
  } catch (err) {
    logger.log('error while getting meetinglist', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addMeetingService = async (req, payload, companyId, userId) => {
  let conn;

  try {
    conn = await db.fetchConn();
    const data = await addMeetingDao(conn, userId, payload, companyId);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error adding meeting, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getMeetingByIdService = async (company, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getMeetingByIdDao(id, company, conn);
    return data;
  } catch (err) {
    logger.log('error while getting meeting', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};
const getListMettingService = async (token, startdate, enddate) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getListMettingServiceDao(
      conn,
      token,
      startdate,
      enddate
    );
    return data;
  } catch (err) {
    logger.log('error while getting meetinglist', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getMettingService,
  getMeetingByIdService,
  addMeetingService,
  getExecuteMettingService,
  getScheduleListMettingService,
  getListMettingService,
};
