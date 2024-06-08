import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getAllCategoryDao,
  addCategoryForMeghmaniDao,
} from '../../dao/categoryDao';
import { getUsersDao } from '../../dao/userDao';
import { getRoleByNameDao } from '../../dao/rolesDao';

import {
  getAllProductsDao,
  getAllProductsLimitDao,
  getProductByIdDao,
  getProductByNameDao,
  addProductDao,
  updateProductDao,
  updateProductStatusDao,
  deleteProductDao,
  getAllProductsForAssignedEmployeeDao,
} from '../../dao/productsDao';

import {
  addProductToEmployeeDao,
  removeProductToEmployeeDao,
  getAllEmployeesAssignedToProductIdDao,
  getAllUnassignedEmployeesForProductIdDao,
} from '../../dao/employeeProductDao';
import { DuplicateDataError, BadRequestError } from '../../utils/appErrors';
import { role_name } from '../../utils/constants';

import { getInventoryDao, updateInventoryDao } from '../../dao/inventoryDao';

const logger = new Logger();

const getAllProductsService = async (payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.token.role_name === role_name.admin) {
      if (payload.page !== undefined && payload.limit !== undefined) {
        data = await getAllProductsLimitDao(conn, payload, offset);
      } else {
        data = await getAllProductsDao(conn, payload);
      }
      return data;
    }
    if (payload.token.role_name === role_name.employee) {
      const dataa = await getAllProductsForAssignedEmployeeDao(conn, payload);
      return dataa;
    }

    throw new BadRequestError('Role name not found');
  } catch (err) {
    logger.log('error while getting categories', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getProductByIdService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getProductByIdDao(conn, payload);
    return data;
  } catch (err) {
    logger.log('error while getting products', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addProductService = async (body, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const productsToAdd = Array.isArray(body) ? body : [body];
    const insertedProducts = [];
    for (const product of productsToAdd) {
      const employeeIDs = `"${product.employees?.join('","')}"`;
      const checkProduct = await getProductByNameDao(
        conn,
        token.companyId,
        product.name
      );

      if (checkProduct !== undefined) {
        throw new BadRequestError('Product name already exists');
      }

      await conn.beginTransaction();
      const data = await addProductDao(conn, product, token);
      if (!data) {
        throw new BadRequestError('Product not added');
      }
      const emp_product_obj = { id: data.id, token, employees: employeeIDs };
      const vendorStock = {
        id: data.id,
        product_name: product.name,
        categoryId: product.categoryId,
        quantity: 0,
      };

      const getExistingStock = await getInventoryDao(conn, token.companyId);
      if (getExistingStock !== undefined) {
        getExistingStock.forEach((outerArray) => {
          const existingArray = outerArray.config;
          existingArray.push(vendorStock);
        });
        await Promise.all(
          getExistingStock.map(async (item) => {
            await updateInventoryDao(conn, token.companyId, item.config);
          })
        );
      }

      await addProductToEmployeeDao(conn, emp_product_obj);
      await conn.commit();
      insertedProducts.push(data);
    }

    return insertedProducts.length === 1
      ? insertedProducts[0]
      : insertedProducts;
  } catch (error) {
    logger.log('error adding product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addMeghmaniProductService = async (body, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    let data;
    const productsToAdd = Array.isArray(body) ? body : [body];
    const insertedProducts = [];
    for (const product of productsToAdd) {
      const employeeIDs = `"${product.employees?.join('","')}"`;
      const checkProduct = await getProductByNameDao(
        conn,
        token.companyId,
        product.name
      );
      if (checkProduct === undefined) {
        await conn.beginTransaction();
        data = await addProductDao(conn, product, token);
      }

      if (!data) {
        throw new BadRequestError('Product not added');
      }
      const emp_product_obj = { id: data.id, token, employees: employeeIDs };
      const vendorStock = {
        id: data.id,
        product_name: product.name,
        categoryId: product.categoryId,
        quantity: 0,
      };

      const getExistingStock = await getInventoryDao(conn, token.companyId);
      if (getExistingStock !== undefined) {
        getExistingStock.forEach((outerArray) => {
          const existingArray = outerArray.config;
          existingArray.push(vendorStock);
        });
        await Promise.all(
          getExistingStock.map(async (item) => {
            await updateInventoryDao(conn, token.companyId, item.config);
          })
        );
      }

      await addProductToEmployeeDao(conn, emp_product_obj);
      await conn.commit();
      insertedProducts.push(data);
    }

    return insertedProducts.length === 1
      ? insertedProducts[0]
      : insertedProducts;
  } catch (error) {
    logger.log('error adding product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateProductService = async (payload) => {
  let conn;
  const employeeIDs = `"${payload.body.employees.join('","')}"`;
  try {
    conn = await db.fetchConn();
    const checkProduct = await getProductByIdDao(conn, payload);
    if (checkProduct === undefined) {
      throw new BadRequestError('Product does not exist');
    }
    const checkDuplicate = await getProductByNameDao(conn, payload);
    if (checkDuplicate !== undefined && checkDuplicate.id !== payload.id) {
      throw new DuplicateDataError('Product with same name already exists');
    }
    await conn.beginTransaction();
    const data = await updateProductDao(conn, payload);
    const emp_product_obj = {
      id: payload.id,
      token: payload.token,
      employees: employeeIDs,
    };
    await addProductToEmployeeDao(conn, emp_product_obj);
    await removeProductToEmployeeDao(conn, emp_product_obj);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateProductStatusService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkProduct = await getProductByIdDao(conn, payload);
    if (!checkProduct) {
      throw new BadRequestError('Product does not exist');
    }
    await conn.beginTransaction();
    const data = await updateProductStatusDao(conn, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteProductService = async (id, companyId, userId) => {
  let conn;

  const Token = {
    token: {
      companyId,
    },
    id,
  };
  try {
    conn = await db.fetchConn();

    const checkProduct = await getProductByIdDao(conn, Token);
    if (checkProduct[0].quantity > 0) {
      throw new BadRequestError(
        'Cannot deleted !!! Product quantity is more than 1'
      );
    }
    await conn.beginTransaction();
    const data = await deleteProductDao(conn, id, companyId, userId);
    const getRole = await getRoleByNameDao(conn, Token.token, 'employee');
    const getUsers = await getUsersDao(conn, companyId, getRole?.id);
    if (getUsers) {
      const employeeIDs = `"${getUsers.user
        .map((object) => object.id)
        .join(',')}"`;

      const emp_product_obj = {
        id,
        token: { companyId, userId },
        employees: employeeIDs,
      };

      await removeProductToEmployeeDao(conn, emp_product_obj);
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error deleting product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const uploadProductService = async (excelData, req) => {
  const { companyId } = req.user;
  const token = req.user;
  const values = [];
  let conn;
  try {
    conn = await db.fetchConn();
    for (const data of excelData) {
      const productName = await getProductByNameDao(conn, companyId, data.name);
      if (productName) {
        throw new BadRequestError('Product already exists');
      }
    }
    const categoryData = await getAllCategoryDao(conn, companyId);
    if (!categoryData) {
      throw new BadRequestError('categories not exists');
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < excelData.length; i++) {
      const { name, hsncode, mrp, quantity } = excelData[i];
      const categories = categoryData.category.filter(
        (category) => category.category_name === excelData[i].category
      );
      if (categories.length > 0) {
        const config = {
          package: excelData[i].package,
          vendorPrices: {},
          vendorPackages: {},
        };
        values.push({
          name,
          hsncode,
          mrp,
          quantity,
          categoryId: categories[0].id,
          companyId,
          config,
        });
      } else {
        throw new BadRequestError('some categories are not exists');
      }
    }
    await conn.beginTransaction();
    const data = await addProductService(values, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error uploading product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const uploadMeghmaniProductService = async (excelData, req) => {
  const { companyId, userId } = req.user;
  const token = req.user;
  const values = [];
  let conn;
  try {
    conn = await db.fetchConn();
    const categoryData = await getAllCategoryDao(conn, companyId);
    for (let i = 0; i < excelData.length; i++) {
      const {
        group_code,
        material_code,
        product_name,
        uom,
        mfg_date,
        exp_date,
        qty_kg_ltr,
        mrp,
        hsncode,
      } = excelData[i];
      const productName = await getProductByNameDao(
        conn,
        companyId,
        product_name
      );
      if (productName === undefined) {
        const categories = categoryData.category.filter(
          (category) => category.category_name === excelData[i].group_name
        );
        if (categories.length === 0) {
          const categoryName = await addCategoryForMeghmaniDao(
            conn,
            companyId,
            userId,
            excelData[i].group_name
          );
          categoryData.category.push(categoryName);
        }
        const config = {
          groupCode: group_code,
          materialCode: material_code,
          uom,
          mfg_date,
          qty_kg_ltr,
          exp_date,
        };
        values.push({
          name: product_name,
          categoryId: categories[0].id,
          companyId,
          hsncode,
          mrp,
          config,
        });
      }
    }
    await conn.beginTransaction();
    const product = await addMeghmaniProductService(values, token);
    await conn.commit();
    return product;
  } catch (error) {
    logger.log('error uploading product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getAllEmployeesAssignedToProductsService = async (id, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getAllEmployeesAssignedToProductIdDao(conn, id, token);
    return data;
  } catch (err) {
    logger.log('error while getting employee product relation', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getAllUnassignedEmployeeForProductIdService = async (
  id,
  token,
  role_id
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getAllUnassignedEmployeesForProductIdDao(
      conn,
      id,
      token,
      role_id
    );
    return data;
  } catch (err) {
    logger.log(
      'error while getting unassigned employee for product',
      'error',
      err
    );
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllProductsService,
  getProductByIdService,
  addProductService,
  updateProductService,
  updateProductStatusService,
  deleteProductService,
  uploadProductService,
  getAllEmployeesAssignedToProductsService,
  getAllUnassignedEmployeeForProductIdService,
  uploadMeghmaniProductService,
};
