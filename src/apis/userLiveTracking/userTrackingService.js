import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getLiveTrackingDao,
  updateLiveTrackingDao,
} from '../../dao/liveTrackingDao';

const logger = new Logger();

const getUserTrackingService = async (token, userId, date) => {
  let conn;
  try {
    conn = await db.fetchConn();

    const data = await getLiveTrackingDao(conn, token, userId, date);
    return data;
  } catch (err) {
    logger.log('error while getting leads', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

// revisit
const updateUserTrackingService = async (id, token, payload) => {
  let conn;
  try {
    const config = payload.live_tracking;
    const formattedConfig = config.map(
      (obj, index) =>
        `${index > 0 ? "'" : ' '}${JSON.stringify(obj)}${
          index < config.length - 1 ? ",'\n" : ' '
        }`
    );
    const formattedObject = `${formattedConfig.join('')}`;
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await updateLiveTrackingDao(conn, id, token, formattedObject);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error updating user tracking, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export { getUserTrackingService, updateUserTrackingService };
