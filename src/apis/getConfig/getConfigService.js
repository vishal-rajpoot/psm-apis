import * as db from '../../utils/db';

import getConfigDao from '../../dao/ConfigDao';

const getConfigService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getConfigDao(conn, payload);
    return data;
  } catch (error) {
    logger.log('error while getting data', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export default getConfigService;
