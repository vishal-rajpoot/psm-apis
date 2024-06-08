import * as db from '../../utils/db';
import Logger from '../../utils/logger';

import {
  getMiscResoureEntriesDao,
  addMiscResoureEntriesDao,
} from '../../dao/miscResoureEntriesDao';

const logger = new Logger();

const getMiscResoureEntriesService = async (token, resourcetype) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getMiscResoureEntriesDao(conn, token, resourcetype);
    return data;
  } catch (err) {
    logger.log('error while getting data', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addMiscResoureEntriesService = async (token, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await addMiscResoureEntriesDao(conn, token, payload);
    return data;
  } catch (err) {
    logger.log('error while Adding data ', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export { getMiscResoureEntriesService, addMiscResoureEntriesService };
