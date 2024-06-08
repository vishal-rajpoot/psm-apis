import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { DuplicateDataError, BadRequestError } from '../../utils/appErrors';
import { VALIDATION_MESSAGES } from '../../utils/constants';

import {
  getAllPackagesDao,
  getAllPackagesLimitDao,
  getPackageByIdDao,
  getPackageByNamedao,
  addPackageDao,
  updatePackageDao,
  deletePackageDao,
  updatePackageStatusDao,
} from '../../dao/packagesDao';
import { getAllProductsDao } from '../../dao/productsDao';

const logger = new Logger();

const getAllPackagesService = async (company, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getAllPackagesLimitDao(conn, company, payload, offset);
    } else {
      data = await getAllPackagesDao(conn, company, payload);
    }
    return data;
  } catch (err) {
    logger.log('error while getting packages', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getPackageByIdService = async (company, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getPackageByIdDao(id, company, conn);
    return data;
  } catch (err) {
    logger.log('error while getting package', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addPackageService = async (company, userId, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkPackage = await getPackageByNamedao(conn, company, payload);
    if (checkPackage !== undefined) {
      throw new DuplicateDataError(`package ${VALIDATION_MESSAGES.DUPLICATE}`);
    }
    await conn.beginTransaction();
    const data = await addPackageDao(conn, company, userId, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error adding package, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updatePackageService = async (id, company, userId, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkPackage = await getPackageByIdDao(id, company, conn);
    if (checkPackage === undefined) {
      throw new BadRequestError('Your Id does not exist');
    }
    const checkDuplicate = await getPackageByNamedao(conn, company, payload);
    if (checkDuplicate !== undefined && checkDuplicate.id !== id) {
      throw new DuplicateDataError(`package ${VALIDATION_MESSAGES.DUPLICATE}`);
    }
    await conn.beginTransaction();
    const data = await updatePackageDao(conn, id, company, userId, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating package, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updatePackageStatusService = async (id, companyId, userId, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkPackage = await getPackageByIdDao(id, companyId, conn);

    if (checkPackage === undefined) {
      throw new BadRequestError('Package does not exist');
    }
    await conn.beginTransaction();
    const data = await updatePackageStatusDao(
      conn,
      id,
      companyId,
      userId,
      payload
    );
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating package, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deletePackageService = async (id, companyId, userId) => {
  let conn;
  const Token = {
    token: {
      companyId,
    },
  };
  try {
    conn = await db.fetchConn();
    const checkPackage = await getPackageByIdDao(id, companyId, conn);
    if (checkPackage === undefined) {
      throw new BadRequestError('Package does not exist');
    }
    const products = await getAllProductsDao(conn, Token);
    if (products) {
      for (const product of products.products) {
        if (product.config?.package === checkPackage[0].package_name) {
          throw new BadRequestError('Package is in use, Cannot Delete');
        }
      }
    }
    await conn.beginTransaction();
    const data = await deletePackageDao(conn, id, companyId, userId);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error deleting package, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllPackagesService,
  getPackageByIdService,
  addPackageService,
  updatePackageService,
  updatePackageStatusService,
  deletePackageService,
};
