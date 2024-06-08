import getAllCountsDao from '../../dao/sideDao';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';

const logger = new Logger();

const getAllCountsService = async (companyId, vendorRoleId, employeeRoleId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getAllCountsDao(
      conn,
      companyId,
      vendorRoleId,
      employeeRoleId
    );
    return data;
  } catch (error) {
    logger.log('error while getting counts', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export default getAllCountsService;
