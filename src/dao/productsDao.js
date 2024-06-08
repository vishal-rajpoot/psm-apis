import { generateUUID } from '../utils/helper';
import { ACTIVE } from '../utils/constants';

const getAllProductsForAssignedEmployeeDao = async (conn, payload) => {
  const sql = `SELECT
  p.id,
  p.product_name,
  p.product_hsncode,
  p.mrp,
  p.quantity,
  pc.category_name,
  p.config,
  u.first_name as updated_by_first_name,
  u.last_name as updated_by_last_name,
  p.status
FROM employee_product_access e
JOIN products p ON JSON_CONTAINS(e.config, JSON_QUOTE(p.id), '$.product_ids')
JOIN product_categories as pc ON p.category=pc.id
JOIN users u ON u.id=p.updated_by
WHERE e.company = '${payload.token.companyId}'
  AND e.employee = '${payload.token.userId}'
  AND p.is_obsolate = false
`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getAllProductsLimitDao = async (conn, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND p.product_name LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from products p
  where p.company = '${payload.token.companyId}' 
  AND p.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select p.id,
  p.product_name,
  p.product_hsncode,
  p.mrp,
  p.quantity,
  pc.category_name,
  p.config,
  u.first_name as updated_by_first_name,
  u.last_name as updated_by_last_name,
  p.status
  FROM products p
  JOIN product_categories as pc ON p.category=pc.id
  JOIN users u ON u.id=p.updated_by
  WHERE p.company = '${payload.token.companyId}'
  AND p.is_obsolate = false
  ${searchCondition} 
  order by p.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const products = await conn.query(sql);
  if (products && products[0]) {
    return { totalRowsValue, products };
  }
  return undefined;
};

const getAllProductsDao = async (conn, payload) => {
  const sql = `select p.id,
  p.product_name,
  p.product_hsncode,
  p.mrp,
  p.quantity,
  pc.category_name,
  p.config,
  u.first_name as updated_by_first_name,
  u.last_name as updated_by_last_name,
  p.status
  FROM products p
  JOIN product_categories as pc ON p.category=pc.id
  JOIN users u ON u.id=p.updated_by 
  WHERE p.company = '${payload.token.companyId}'
  AND p.is_obsolate = false
  order by p.created_at DESC
`;
  const products = await conn.query(sql);
  if (products && products[0]) {
    return { products };
  }
  return undefined;
};

const getAllProductsForVendorDao = async (conn, token) => {
  const sql = `select p.id,
  p.product_name,
  p.category as categoryId
  FROM products p
  WHERE p.company = '${token.companyId}'
  AND p.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getProductByIdDao = async (conn, payload) => {
  const sql = `select p.id,
    p.product_name,
    p.product_hsncode,
    p.mrp,
    p.quantity,
    pc.category_name,
    p.config,
    u.first_name as updated_by_first_name,
    u.last_name as updated_by_last_name,
    p.status
    FROM products as p
    JOIN product_categories as pc ON p.category=pc.id
    JOIN users u ON u.id = p.updated_by
    WHERE p.company = '${payload.token.companyId}'
    AND p.id = '${payload.id}'
    AND p.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data;
  }
  return undefined;
};

const getAllProductsByHsnDao = async (conn, companyId, hsnCode) => {
  const sql = `select p.id,
  p.product_name,
  p.product_hsncode
  FROM products as p
  WHERE p.company = '${companyId}'
  AND p.product_hsncode = '${hsnCode}'
  AND p.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getProductByNameDao = async (conn, companyId, name) => {
  const sql = `select *
  FROM products as p
  WHERE p.company = '${companyId}'
  AND p.product_name = '${name}'
  AND p.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data[0];
  }
  return undefined;
};

const addProductDao = async (conn, payload, token) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `INSERT INTO products (id, product_name, product_hsncode, mrp, category, company, created_by,updated_by, status, config)
  VALUES ('${id}', '${payload.name}','${payload.hsncode}','${payload.mrp}', '${payload.categoryId}','${token.companyId}','${token.userId}',
  '${token.userId}','${ACTIVE}', '${config}')
  RETURNING products.id`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const updateProductDao = async (conn, payload) => {
  const config = JSON.stringify(payload.body.config);
  const sql = `UPDATE products
  SET updated_by = '${payload.token.userId}',
  product_name = '${payload.body.name}',
  product_hsncode = '${payload.body.hsncode}',
  category = '${payload.body.categoryId}',
  mrp = '${payload.body.mrp}',
  config = '${config}'
  WHERE products.id = '${payload.id}'
  AND products.company = '${payload.token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const updateProductStatusDao = async (conn, payload) => {
  const sql = `UPDATE products
  SET status = '${payload.body.status}'
  WHERE products.id = '${payload.id}'
  AND products.company = '${payload.token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deleteProductDao = async (conn, id, company, userId) => {
  const sql = `UPDATE products
  SET is_obsolate = true , updated_by = '${userId}'
  WHERE products.id = '${id}'
  AND products.company = '${company}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

export {
  getAllProductsDao,
  getAllProductsLimitDao,
  getProductByIdDao,
  getProductByNameDao,
  addProductDao,
  updateProductDao,
  updateProductStatusDao,
  deleteProductDao,
  getAllProductsForAssignedEmployeeDao,
  getAllProductsForVendorDao,
  getAllProductsByHsnDao,
};
