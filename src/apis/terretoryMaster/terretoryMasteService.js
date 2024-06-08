import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  uploadTerretoryReportDao,
  getTerreroryDetilsDao,
} from '../../dao/uploadTerretoryMastertDao';

const logger = new Logger();

const uploadTerretoryReportService = async (token, excelData) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const generalManagers = [];
    const zonalManagers = [];
    const regionalManagers = [];
    const territories = [];
    excelData.forEach((entry) => {
      if (
        entry['General Manager'] &&
        !generalManagers.includes(entry['General Manager'])
      ) {
        generalManagers.push(entry['General Manager']);
      }
      if (
        entry['Zonal Manager'] &&
        !zonalManagers.includes(entry['Zonal Manager'])
      ) {
        zonalManagers.push(entry['Zonal Manager']);
      }
      if (
        entry['Regional Manager'] &&
        !regionalManagers.includes(entry['Regional Manager'])
      ) {
        regionalManagers.push(entry['Regional Manager']);
      }
      if (entry.Territory && !territories.includes(entry.Territory)) {
        territories.push(entry.Territory);
      }
    });
    const terretory = await uploadTerretoryReportDao(
      conn,
      token,
      generalManagers,
      zonalManagers,
      regionalManagers,
      territories
    );
    return terretory;
  } catch (error) {
    logger.log('error while adding Terretory', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getTerretoryDetilsService = async (token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getTerreroryDetilsDao(conn, token);
    return data;
  } catch (err) {
    logger.log('error while getting terretory', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};
export { uploadTerretoryReportService, getTerretoryDetilsService };
