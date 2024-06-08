import { getTaxDao, updateTaxDao } from '../../dao/taxDao';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';

const logger = new Logger();

const getTaxService = async (token, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getTaxDao(conn, token, id);
    return data;
  } catch (error) {
    logger.log('error while getting tax', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateTaxService = async (companyId, payload) => {
  let conn;

  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await updateTaxDao(conn, companyId, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while updating setting', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
export { getTaxService, updateTaxService };
