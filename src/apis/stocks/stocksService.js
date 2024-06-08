/* eslint-disable no-plusplus */
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { getAllProductsDao } from '../../dao/productsDao';
import { BadRequestError } from '../../utils/appErrors';

import {
  getStocksDao,
  getStocksByIdDao,
  getStocksLimitDao,
  addStockDao,
  updateStockDao,
  getStocksQuantityByIdDao,
  removeStockDao,
} from '../../dao/stocksDao';

const logger = new Logger();

const getStocksService = async (companyId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getStocksLimitDao(conn, companyId, payload, offset);
    } else {
      data = await getStocksDao(conn, companyId, payload);
    }
    return data;
  } catch (err) {
    logger.log('error while getting stocks', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getStocksByIdService = async (req, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getStocksByIdDao(conn, req, id);
    return data;
  } catch (err) {
    logger.log('error while getting stocks', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addStockService = async (req) => {
  let conn;
  const stocksArray = req.body;
  const response = [];
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    for (const stockArray of stocksArray) {
      const data = await addStockDao(conn, req.user, stockArray);
      response.push(data);
    }
    await conn.commit();
    return response;
  } catch (error) {
    logger.log('error adding stock, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const uploadProductStockService = async (excelData, req) => {
  const token = req.user;
  const payload = {
    token,
  };
  const values = [];
  let conn;
  const stocks = [];
  const seen = {};
  const duplicates = [];
  let hasNegativeStock = false;
  try {
    conn = await db.fetchConn();
    if (excelData[0].product_name && excelData[0].stock_quantity) {
      const productsData = await getAllProductsDao(conn, payload);
      if (!productsData) {
        throw new BadRequestError('products not exists');
      }
      for (const product of excelData) {
        const productName = product.product_name;
        const stockQuantity = product.stock_quantity;
        if (productName) {
          if (seen[productName]) {
            duplicates.push(productName);
          } else {
            seen[productName] = true;
          }
        }
        if (stockQuantity < 0) {
          hasNegativeStock = true;
        }
      }
      if (hasNegativeStock) {
        throw new BadRequestError('Some products have negative stock quantity');
      }
      if (duplicates.length > 0) {
        throw new BadRequestError(
          `Duplicate product names found: ${duplicates.join(', ')}`
        );
      }
      for (let i = 0; i < excelData.length; i++) {
        const { stock_quantity } = excelData[i];
        const productNames = productsData.products.filter(
          (product) => product.product_name === excelData[i].product_name
        );
        if (productNames.length > 0 && stock_quantity) {
          stocks.push({
            productId: productNames[0].id,
            quantity: stock_quantity,
          });
        } else {
          throw new BadRequestError('some product names does not exists');
        }
      }
      const stockData = {
        user: req.user,
        body: stocks,
      };
      await conn.beginTransaction();
      const data = await addStockService(stockData);
      values.push(data);
      await conn.commit();
      return values;
    }
    throw new BadRequestError(
      'please select proper file. in this file data is not exists'
    );
  } catch (error) {
    logger.log(
      'error uploading product-Stock, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const updateStockService = async (req) => {
  let conn;
  const { id } = req.params;

  try {
    conn = await db.fetchConn();
    const StockQuantity = await getStocksQuantityByIdDao(
      conn,
      id,
      req.user.companyId
    );
    if (StockQuantity === undefined) {
      throw new BadRequestError('Stock id does not exists');
    }
    await conn.beginTransaction();
    const data = await updateStockDao(conn, req, id, StockQuantity);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating stock, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const removeStockService = async (id, companyId) => {
  let conn;

  try {
    conn = await db.fetchConn();
    const checkStock = await getStocksQuantityByIdDao(conn, id, companyId);
    if (!checkStock) {
      throw new BadRequestError('Stock id does not exists');
    }
    const data = await removeStockDao(conn, id, companyId, checkStock);
    return data;
  } catch (error) {
    logger.log('error while deleting Stock', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getStocksService,
  getStocksByIdService,
  addStockService,
  uploadProductStockService,
  updateStockService,
  removeStockService,
};
