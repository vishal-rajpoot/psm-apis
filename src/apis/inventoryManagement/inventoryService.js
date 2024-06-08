/* eslint-disable guard-for-in */
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  addInventoryDao,
  deleteInventoryDao,
  getInventoryByIdDao,
  getInventoryByVendorIdDao,
  getInventoryDao,
  updateInventoryProductDao,
  updateProductQuantityDao,
} from '../../dao/inventoryDao';
// import { getProductByIdDao } from '../../dao/productsDao';
import { BadRequestError } from '../../utils/appErrors';
import { getCategoriesNameandIdDao } from '../../dao/categoryDao';

const logger = new Logger();

const getInventoryService = async (companyId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getInventoryDao(conn, companyId);
    return data;
  } catch (error) {
    logger.log('error while getting Inventory', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getInventoryByIdService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getInventoryByVendorIdDao(conn, companyId, id);
    const data2 = await getCategoriesNameandIdDao(conn, companyId);
    const productCategoryTable = {};

    for (const category of data2) {
      productCategoryTable[category.id] = category.category_name;
    }
    const categoryMapping = {};
    for (const config of data.config) {
      if (config.categoryId) {
        const categoryName = productCategoryTable[config.categoryId];
        categoryMapping[config.categoryId] = categoryName;
      }
    }

    const modifiedResponse = [];
    for (const categoryId in categoryMapping) {
      const categoryName = categoryMapping[categoryId];
      const products = [];
      for (const config of data.config) {
        if (config.categoryId === categoryId) {
          products.push({
            id: config.id,
            product_name: config.product_name,
            quantity: config.quantity,
          });
        }
      }
      modifiedResponse.push({
        'category name': categoryName,
        products,
      });
    }
    const finalResponse = [
      {
        id: data.id,
        vendor: data.vendor,
        config: modifiedResponse,
      },
    ];

    return finalResponse;
  } catch (error) {
    logger.log(`error while getting Inventory by Id '${id}' `, 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addInventoryService = async (companyId, userId, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await addInventoryDao(conn, companyId, userId, payload);
    return data;
  } catch (error) {
    logger.log('error while adding the Inventory', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateInventoryService = async (payload) => {
  let conn;
  const arr = [];

  try {
    conn = await db.fetchConn();
    const getData = await getInventoryByIdDao(conn, payload);
    if (getData === undefined) {
      throw new BadRequestError('Vendor Inventory data not found');
    }
    for (const product of payload.body) {
      for (const item of getData.config) {
        if (item.id === product.product_id) {
          // const productObj = {
          //   id: product.product_id,
          //   token: payload.token,
          // };
          // const getProduct = await getProductByIdDao(conn, productObj);
          // if (getProduct[0].quantity < product.quantity) {
          //   throw new BadRequestError(
          //     `${getProduct[0].product_name} stocks is not in range`
          //   );
          // } else {
          item.quantity = product.quantity + item.quantity;
          await updateProductQuantityDao(conn, payload.token, product);
          // }

          arr.push(item);
        }
      }
    }
    const mergedData = getData?.config?.map((obj) => {
      const matchingObj = arr.find((item) => item.id === obj.id);
      return { ...obj, ...matchingObj };
    });
    // eslint-disable-next-line no-param-reassign
    payload.body = mergedData;
    const data = await updateInventoryProductDao(conn, payload);

    return data;
  } catch (error) {
    logger.log('error while updating the Inventory', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteInventoryService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteInventoryDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while deleting the Inventory', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getInventoryService,
  getInventoryByIdService,
  addInventoryService,
  updateInventoryService,
  deleteInventoryService,
};
