import { generateUUID } from '../utils/helper';

const getInventoryDao = async (conn, companyId) => {
  const sql = `select vs.id,
  CONCAT(u.first_name, ' ', u.last_name) as vendor,
  vs.config
  from vendor_stocks as vs
  join users as u on vs.vendor_id = u.id
  where vs.company = '${companyId}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};
const getInventoryByVendorIdDao = async (conn, companyId, id) => {
  const sql = `select vs.id,
  CONCAT(u.first_name, ' ', u.last_name) as vendor,
  vs.config
  from vendor_stocks as vs
  join users as u on vs.vendor_id = u.id
  where vs.company = '${companyId}'
  and vs.vendor_id = '${id}'
  and u.is_obsolate = false  `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const getInventoryByIdDao = async (conn, payload) => {
  const sql = `select vs.id, vs.config
    from vendor_stocks as vs
    where vs.company = '${payload.token.companyId}'
    and vs.vendor_id = '${payload.vendor_id}'
    and vs.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const addInventoryDao = async (conn, token, payload) => {
  const configData = JSON.stringify(payload.config);
  const id = generateUUID();
  const sql = `insert into vendor_stocks (id, config, company, vendor_id, created_by, updated_by) values
    ('${id}', '${configData}', '${token.companyId}', '${payload.vendor_id}', '${token.userId}', '${token.userId}')`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateInventoryDao = async (conn, companyId, payload) => {
  const config = JSON.stringify(payload);
  const sql = `UPDATE vendor_stocks
  SET config = '${config}'
  WHERE company = '${companyId}'`;
  const data = await conn.query(sql);
  return data;
};

const updateInventoryProductDao = async (conn, payload) => {
  const configData = JSON.stringify(payload.body);
  const sql = `update vendor_stocks set config = '${configData}'
  where company = '${payload.token.companyId}' and vendor_id = '${payload.vendor_id}'
`;
  const data = await conn.query(sql);
  return data;
};

const updateProductQuantityDao = async (conn, token, product) => {
  const sql = `UPDATE products
  SET updated_by = '${token.userId}',
  quantity = quantity - ${product.quantity}
  WHERE products.id = '${product.product_id}'
  AND products.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deleteInventoryDao = async (conn, companyId, id) => {
  const sql = `update vendor_stocks set is_obsolate = true
  where company = '${companyId}' and id = '${id}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

export {
  getInventoryDao,
  getInventoryByVendorIdDao,
  getInventoryByIdDao,
  addInventoryDao,
  updateInventoryDao,
  updateInventoryProductDao,
  updateProductQuantityDao,
  deleteInventoryDao,
};
