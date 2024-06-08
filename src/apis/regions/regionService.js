import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { BadRequestError } from '../../utils/appErrors';

import {
  getRegionsDao,
  getRegionsLimitDao,
  getRegionByIdDao,
  deleteRegionDao,
  addRegionDao,
  updateRegionDao,
} from '../../dao/regionDao';

const logger = new Logger();

const getRegionsService = async (token, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getRegionsLimitDao(conn, token, payload, offset);
    } else {
      data = await getRegionsDao(conn, token, payload);
    }
    return data;
  } catch (error) {
    logger.log('error while getting Regions', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getRegionByIdService = async (token, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getRegionByIdDao(conn, token, id);
    return data;
  } catch (error) {
    logger.log(`error while getting Region  by ${id} id`, 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateRegionService = async (id, payload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await updateRegionDao(conn, id, payload, token);
    return data;
  } catch (error) {
    logger.log('error while updating Region', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addRegionService = async (payload, token) => {
  let conn;
  const bulkRegions = [];
  try {
    conn = await db.fetchConn();
    const regions = await getRegionsDao(conn, token);

    const existingRegions = regions?.region.map((item) => item.region);
    await conn.beginTransaction();
    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (existingRegions?.includes(item.region)) {
          throw new BadRequestError('Region value already exists');
        } else {
          const addedData = await addRegionDao(conn, item, token);
          const addedRegions = {
            id: addedData.id,
            region: item.region,
          };
          bulkRegions.push(addedRegions);
        }
      }
      await conn.commit();
      return bulkRegions;
      // eslint-disable-next-line no-else-return
    } else if (existingRegions?.includes(payload.region)) {
      throw new BadRequestError('Region value already exists');
    } else {
      const addedData = await addRegionDao(conn, payload, token);
      const addedRegion = {
        id: addedData.id,
        region: payload.region,
      };
      await conn.commit();

      return addedRegion;
    }
  } catch (error) {
    logger.log('Error while adding Region', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const deleteRegionService = async (id, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteRegionDao(conn, id, token);
    return data;
  } catch (error) {
    logger.log('error while deleting Region', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getRegionsService,
  getRegionByIdService,
  updateRegionService,
  addRegionService,
  deleteRegionService,
};
