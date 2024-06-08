import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import getAppUpdateDetailDao from '../../dao/appUpdateDao';

const logger = new Logger();

const getAppUpdateDetailService = async () => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getAppUpdateDetailDao(conn);
    return data;
  } catch (err) {
    logger.log('error while getting app update details', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export default getAppUpdateDetailService;
