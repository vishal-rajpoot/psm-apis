/* eslint-disable no-param-reassign */
import { DiscountBased, DiscountType } from '../../utils/constants';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  addDiscountDao,
  deleteDiscountDao,
  getAllDiscountsDao,
  getDiscountByIdDao,
  getDiscountsLimitDao,
  updateDiscountDao,
} from '../../dao/discountDao';
import { getAllProductsByHsnDao } from '../../dao/productsDao';
import { BadRequestError } from '../../utils/appErrors';
import { getUserByIdDao } from '../../dao/userDao';

const logger = new Logger();

const getAllDiscountsService = async (companyId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getDiscountsLimitDao(conn, companyId, payload, offset);
    } else {
      data = await getAllDiscountsDao(conn, companyId, payload);
    }

    return data;
  } catch (err) {
    logger.log('error while getting discounts', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getDiscountByIdService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getDiscountByIdDao(conn, companyId, id);
    return data;
  } catch (err) {
    logger.log('error while getting discount by id', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addDiscountService = async (company, payload) => {
  let conn;
  let data;
  const allVendors = 'All Vendors';
  const result = [];
  try {
    conn = await db.fetchConn();
    const { products, vendors } = payload.config;
    if (payload.based === DiscountBased.product) {
      if (payload.config.type === DiscountType.product) {
        for (const product of products) {
          if (vendors.length === 0) {
            result.push({
              product_id: product.product_id,
              product_name: product.product_name,
              vendor_name: allVendors,
              discount: parseFloat(payload.discount),
            });
          } else {
            for (const vendor of vendors) {
              const user = await getUserByIdDao(
                conn,
                company,
                vendor.vendor_id
              );
              result.push({
                product_id: product.product_id,
                product_name: product.product_name,
                vendor_id: vendor.vendor_id,
                vendor_name: vendor.vendor_name,
                company_name: user[0].config.company,
                discount: parseFloat(payload.discount),
              });
            }
          }
        }
        const { type } = payload.config;
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config = {
          ...payload.config,
          type,
          result,
        };
        data = await addDiscountDao(conn, company, payload);
      } else {
        const allProducts = [];
        let productsFromDb;
        const { hsn } = payload.config;
        for (const hsncode of hsn) {
          productsFromDb = await getAllProductsByHsnDao(conn, company, hsncode);
          allProducts.push(productsFromDb);
        }

        for (const product of allProducts) {
          for (const insideProduct of product) {
            if (vendors.length === 0) {
              result.push({
                product_id: insideProduct.id,
                product_name: insideProduct.product_name,
                vendor_name: allVendors,
                discount: parseFloat(payload.discount),
              });
            } else {
              for (const vendor of vendors) {
                const user = await getUserByIdDao(
                  conn,
                  company,
                  vendor.vendor_id
                );
                result.push({
                  product_id: insideProduct.id,
                  product_name: insideProduct.product_name,
                  vendor_id: vendor.vendor_id,
                  vendor_name: vendor.vendor_name,
                  company_name: user[0].config.company,
                  discount: parseFloat(payload.discount),
                });
              }
            }
          }
        }

        const { type } = payload.config;
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config = {
          ...payload.config,
          type,
          hsn,
          result,
        };
        data = await addDiscountDao(conn, company, payload);
      }
    } else if (payload.based === DiscountBased.vendor) {
      for (const vendor of vendors) {
        const user = await getUserByIdDao(conn, company, vendor.vendor_id);
        result.push({
          vendor_id: vendor.vendor_id,
          vendor_name: vendor.vendor_name,
          company_name: user[0].config.company,
          discount: parseFloat(payload.discount),
        });
      }
      payload.config = {};
      payload.config.result = result;
      data = await addDiscountDao(conn, company, payload);
    } else if (payload.based === DiscountBased.unit) {
      if (payload.config.type === DiscountType.hsn) {
        const { type, hsn } = payload.config;
        const allProducts = await getAllProductsByHsnDao(conn, company, hsn);

        for (const product of allProducts) {
          result.push({
            product_name: product.product_name,
            discount: payload.discount,
            unit: payload.config.unit.unit_name,
            unit_qty: payload.config.qty,
            discount_unit: payload.config.discount_unit.unit_name,
            discount_product: payload.config.discount_product.product_name,
            discount_unit_qty: parseFloat(payload.config.discount_qty),
          });
        }
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config = {
          ...payload.config,
          type,
          hsn,
          result,
        };

        data = await addDiscountDao(conn, company, payload);
      } else {
        result.push({
          product_name: payload.config.product.product_name,
          discount: payload.discount,
          unit: payload.config.unit.unit_name,
          unit_qty: parseFloat(payload.config.qty),
          discount_unit: payload.config.discount_unit.unit_name,
          discount_product: payload.config.discount_product.product_name,
          discount_unit_qty: parseFloat(payload.config.discount_qty),
        });

        const { type } = payload.config;
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config.type = type;
        payload.config.result = result;
        data = await addDiscountDao(conn, company, payload);
      }
    } else {
      throw new BadRequestError('Invalid discount');
    }
    return data;
  } catch (err) {
    logger.log('error while adding discount', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const updateDiscountService = async (company, id, payload) => {
  let conn;
  let data;
  const allVendors = 'All Vendors';
  const result = [];
  try {
    conn = await db.fetchConn();
    const { products, vendors } = payload.config;
    if (payload.based === DiscountBased.product) {
      if (payload.config.type === DiscountType.product) {
        for (const product of products) {
          if (vendors.length === 0) {
            result.push({
              product_id: product.product_id,
              product_name: product.product_name,
              vendor_name: allVendors,
              discount: parseFloat(payload.discount),
            });
          } else {
            for (const vendor of vendors) {
              const user = await getUserByIdDao(
                conn,
                company,
                vendor.vendor_id
              );
              result.push({
                product_id: product.product_id,
                product_name: product.product_name,
                vendor_id: vendor.vendor_id,
                vendor_name: vendor.vendor_name,
                company_name: user[0].config.company,
                discount: parseFloat(payload.discount),
              });
            }
          }
        }
        const { type } = payload.config;
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config = {
          ...payload.config,
          type,
          result,
        };
        data = await updateDiscountDao(conn, company, id, payload);
      } else {
        const allProducts = [];
        let productsFromDb;
        const { hsn } = payload.config;
        for (const hsncode of hsn) {
          productsFromDb = await getAllProductsByHsnDao(conn, company, hsncode);
          allProducts.push(productsFromDb);
        }

        for (const product of allProducts) {
          for (const insideProduct of product) {
            if (vendors.length === 0) {
              result.push({
                product_id: insideProduct.id,
                product_name: insideProduct.product_name,
                vendor_name: allVendors,
                discount: parseFloat(payload.discount),
              });
            } else {
              for (const vendor of vendors) {
                const user = await getUserByIdDao(
                  conn,
                  company,
                  vendor.vendor_id
                );
                result.push({
                  product_id: insideProduct.id,
                  product_name: insideProduct.product_name,
                  vendor_id: vendor.vendor_id,
                  vendor_name: vendor.vendor_name,
                  company_name: user[0].config.company,
                  discount: parseFloat(payload.discount),
                });
              }
            }
          }
        }

        const { type } = payload.config;
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config = {
          ...payload.config,
          type,
          hsn,
          result,
        };
        data = await updateDiscountDao(conn, company, id, payload);
      }
    } else if (payload.based === DiscountBased.vendor) {
      for (const vendor of vendors) {
        const user = await getUserByIdDao(conn, company, vendor.vendor_id);
        result.push({
          vendor_id: vendor.vendor_id,
          vendor_name: vendor.vendor_name,
          company_name: user[0].config.company,
          discount: parseFloat(payload.discount),
        });
      }
      payload.config = {};
      payload.config.result = result;
      data = await updateDiscountDao(conn, company, id, payload);
    } else if (payload.based === DiscountBased.unit) {
      if (payload.config.type === DiscountType.hsn) {
        const { hsn, type } = payload.config;
        const allProducts = await getAllProductsByHsnDao(conn, company, hsn);

        for (const product of allProducts) {
          result.push({
            product_name: product.product_name,
            discount: payload.discount,
            unit: payload.config.unit.unit_name,
            unit_qty: payload.config.qty,
            discount_unit: payload.config.discount_unit.unit_name,
            discount_product: payload.config.discount_product.product_name,
            discount_unit_qty: parseFloat(payload.config.discount_qty),
          });
        }
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config = {
          ...payload.config,
          type,
          hsn,
          result,
        };

        data = await updateDiscountDao(conn, company, id, payload);
      } else {
        result.push({
          product_name: payload.config.product.product_name,
          discount: payload.discount,
          unit: payload.config.unit.unit_name,
          unit_qty: parseFloat(payload.config.qty),
          discount_unit: payload.config.discount_unit.unit_name,
          discount_product: payload.config.discount_product.product_name,
          discount_unit_qty: parseFloat(payload.config.discount_qty),
        });

        const { type } = payload.config;
        Object.keys(payload.config).forEach((key) => {
          if (key !== type) {
            delete payload.config[key];
          }
        });
        payload.config.type = type;
        payload.config.result = result;
        data = await updateDiscountDao(conn, company, id, payload);
      }
    } else {
      throw new BadRequestError('Invalid discount');
    }
    return data;
  } catch (err) {
    logger.log('error while updating discount', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const deleteDiscountService = async (id, companyId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteDiscountDao(conn, id, companyId);
    return data;
  } catch (err) {
    logger.log('error while deleting discount', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllDiscountsService,
  getDiscountByIdService,
  addDiscountService,
  updateDiscountService,
  deleteDiscountService,
};
