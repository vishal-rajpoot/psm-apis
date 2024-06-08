import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getAllCategoryDao,
  getAllCategoryLimitDao,
  getCategoryByIdDao,
  addCategoryDao,
  updateCategoryDao,
  deleteCategoryDao,
  getCategoryByNameDao,
} from '../../dao/categoryDao';
import {
  BadRequestError,
  DuplicateDataError,
  NotFoundError,
} from '../../utils/appErrors';
import { VALIDATION_MESSAGES, NOT_FOUND_MESSAGE } from '../../utils/constants';
import { getAllProductsDao } from '../../dao/productsDao';

const logger = new Logger();

const getAllCategoriesService = async (company, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined || payload.limit !== undefined) {
      data = await getAllCategoryLimitDao(conn, company, payload, offset);
    } else {
      data = await getAllCategoryDao(conn, company, payload);
    }
    return data;
  } catch (err) {
    logger.log('error while getting categories', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getCategoryByIdService = async (company, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getCategoryByIdDao(conn, company, id);
    return data;
  } catch (err) {
    logger.log('error while getting category', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addCategoryService = async (companyId, userId, name) => {
  let conn;
  let data;
  const bulkCategories = [];
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();

    const names = Array.isArray(name) ? name : [name];
    for (const item of names) {
      const checkCategory = await getCategoryByNameDao(
        conn,
        companyId,
        item.category_name
      );
      if (checkCategory !== undefined) {
        throw new DuplicateDataError(
          `Category ${VALIDATION_MESSAGES.DUPLICATE}`
        );
      }
    }
    for (const item of names) {
      data = await addCategoryDao(conn, companyId, userId, item.category_name);
      const category = {
        id: data.id,
        category: item.category_name,
      };
      bulkCategories.push(category);
    }
    await conn.commit();
    return bulkCategories;
  } catch (error) {
    logger.log('error adding category, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateCategoryService = async (id, token, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkCategory = await getCategoryByIdDao(conn, token.companyId, id);
    if (checkCategory === undefined) {
      throw new NotFoundError(`Category ${NOT_FOUND_MESSAGE}`);
    }
    const checkDuplicate = await getCategoryByNameDao(
      conn,
      token.companyId,
      payload.category_name
    );
    if (checkDuplicate !== undefined && checkDuplicate.id !== id) {
      throw new DuplicateDataError(`Category ${VALIDATION_MESSAGES.DUPLICATE}`);
    }

    await conn.beginTransaction();
    const data = await updateCategoryDao(conn, id, token, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating data, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteCategoryService = async (id, companyId, userId) => {
  let conn;
  const Token = {
    token: {
      companyId,
    },
  };
  try {
    conn = await db.fetchConn();
    const checkCategory = await getCategoryByIdDao(conn, companyId, id);
    if (checkCategory === undefined) {
      throw new BadRequestError('Category not found');
    }
    const products = await getAllProductsDao(conn, Token);
    if (products) {
      for (const product of products.products) {
        if (product.category_name === checkCategory.category_name) {
          throw new BadRequestError('Category is in use, Cannot deleted');
        }
      }
    }
    await conn.beginTransaction();
    const data = await deleteCategoryDao(conn, id, companyId, userId);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error deleting data, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllCategoriesService,
  getCategoryByIdService,
  addCategoryService,
  updateCategoryService,
  deleteCategoryService,
};
