import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getUnitDao,
  getUnitLimitDao,
  getUnitByIdDao,
  deleteUnitDao,
  addUnitDao,
  updateUnitDao,
  updateUnitPositionDao,
  updateUnitHierarchyDao,
} from '../../dao/unitDao';
import { BadRequestError } from '../../utils/appErrors';
import { getAllPackagesDao } from '../../dao/packagesDao';

const logger = new Logger();

const getUnitsService = async (token, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getUnitLimitDao(conn, token, payload, offset);
    } else {
      data = await getUnitDao(conn, token, payload);
    }
    return data;
  } catch (error) {
    logger.log('error while getting Units', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getUnitByIdService = async (token, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getUnitByIdDao(conn, token, id);
    return data;
  } catch (error) {
    logger.log(`error while getting Unit  by ${id} id`, 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateUnitHierarchyService = async (payload, token) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    if (payload.length > 0) {
      const getData = await getUnitDao(conn, token);
      for (const payloadData of payload) {
        if (getData.unit.length > 0) {
          for (const unitData of getData.unit) {
            if (unitData.id === payloadData.id) {
              const { id } = payloadData;
              const { position } = payloadData;
              data = await updateUnitHierarchyDao(conn, id, position, token);
            }
          }
        }
      }
    }
    return data;
  } catch (error) {
    logger.log('error while updating Unit', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateUnitService = async (id, payload, token) => {
  let conn;
  let data;
  let unitfound = false;

  try {
    conn = await db.fetchConn();
    if (payload.unit) {
      const getData = await getUnitDao(conn, token);
      if (getData.unit.length > 0) {
        for (const unitData of getData.unit) {
          if (unitData.unit === payload.unit) {
            unitfound = true;
            throw new BadRequestError('unit name already exsist');
          }
        }
        if (!unitfound) {
          data = await updateUnitDao(conn, id, payload, token);
        }
      }
    }
    return data;
  } catch (error) {
    logger.log('error while updating Unit', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addUnitService = async (payload, token) => {
  let conn;
  let data;
  let unitfound = false;
  try {
    conn = await db.fetchConn();

    const getData = await getUnitDao(conn, token);
    if (getData?.unit !== undefined) {
      let position = getData.unit.length + 1;
      for (const unitData of getData.unit) {
        if (unitData.unit === payload.unit) {
          unitfound = true;
          throw new BadRequestError('unit name already exists');
        }
      }
      if (!unitfound) {
        if (payload.length > 1) {
          for (const item of payload) {
            for (const unitData of getData.unit) {
              if (item.unit === unitData.unit) {
                throw new BadRequestError('unit name already exists');
              }
            }
            data = await addUnitDao(conn, item, position, token);
            position += 1;
          }
        } else {
          data = await addUnitDao(conn, payload, position, token);
        }
      }
    } else if (getData === undefined) {
      const position = 1;
      data = await addUnitDao(conn, payload, position, token);
    }

    return data;
  } catch (error) {
    logger.log('error while adding Unit', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteUnitService = async (id, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const getData = await getUnitByIdDao(conn, token, id);
    if (!getData) {
      throw new BadRequestError('Unit not found');
    }
    const packages = await getAllPackagesDao(conn, token.companyId);
    if (packages) {
      for (const SubPackage of packages.packageData) {
        const insidePackages = SubPackage?.config.packages;

        if (
          SubPackage?.config.packageUnit === getData[0]?.unit ||
          SubPackage?.config.packageSubUnit === getData[0]?.unit
        ) {
          throw new BadRequestError('Cannot deleted! Unit is in use');
        }
        for (const subPackages of insidePackages) {
          if (
            subPackages?.unit === getData[0]?.unit ||
            subPackages?.subUnit === getData[0]?.unit
          ) {
            throw new BadRequestError('Cannot deleted! Unit is in use');
          }
        }
      }
    }
    const data = await deleteUnitDao(conn, id, token);
    if (data > 0) {
      const getUnit = await getUnitDao(conn, token);
      if (getUnit) {
        for (const unitData of getUnit.unit) {
          if (getData[0].position < unitData.position) {
            const position = unitData.position - 1;
            const unitId = unitData.id;
            await updateUnitPositionDao(conn, unitId, position, token);
          }
        }
      }
    }
    return data;
  } catch (error) {
    logger.log('error while deleting Unit', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getUnitsService,
  getUnitByIdService,
  updateUnitService,
  addUnitService,
  deleteUnitService,
  updateUnitHierarchyService,
};
