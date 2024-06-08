import { generateUUID } from '../utils/helper';

const getCompaniesDao = async (conn) => {
  const sql = `SELECT id, name as company_name, 
  email, contact_no
  FROM companies as c
  where c.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getCompany = async (conn, companyId) => {
  const sql = `SELECT config FROM companies as c
  WHERE c.id = '${companyId}'
  and c.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getCompanyByMobile = async (conn, contact_no) => {
  const sql = `SELECT id, config FROM companies as c
  WHERE c.contact_no = '${contact_no}'
  and c.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getTerritoriesDao = async (conn, companyId) => {
  const sql = `select config
  FROM companies c
  WHERE c.company = '${companyId}'
  AND c.is_obsolate = false
  order by c.created_at DESC
`;
  const products = await conn.query(sql);
  if (products && products[0]) {
    return { products };
  }
  return undefined;
};
const getConfigDao = async (conn, payload) => {
  let sql;
  const params = [payload.companyId];
  if (payload.key) {
    sql = `SELECT JSON_EXTRACT(config, '$.${payload.key}') AS config_value FROM companies WHERE id = ?  AND is_obsolate = false`;
  } else {
    sql = 'SELECT config FROM companies WHERE id = ? AND is_obsolate = false';
  }

  const data = await conn.query(sql, params);
  if (data) {
    return data;
  }
  return undefined;
};

const getnegativeStockDao = async (conn, companyId) => {
  const sql = `SELECT JSON_EXTRACT(config, '$.negative_stock') AS negative_stock
  FROM companies
  WHERE id = '${companyId}'
  AND is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const addCompanyDao = async (conn, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `INSERT INTO companies(id, name, email, contact_no, address, city, state, country, pincode, config)
    values ('${id}', '${payload.company_name}', '${payload.email}', '${payload.contact_no}', '${payload.address}', '${payload.city}', '${payload.state}', '${payload.country}', '${payload.pincode}', '${config}')
    RETURNING companies.id`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateCompany = async (conn, payload, companyId) => {
  const config = JSON.stringify(payload);
  const sql = `UPDATE companies SET config = '${config}' WHERE id = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

const updateNegativeStockDao = async (conn, payload, companyId) => {
  const sql = `UPDATE companies
  SET config = JSON_SET(config, '$.negative_stock', ${payload.negative_stock})
  WHERE id = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

const getLabelingDao = async (conn, companyId) => {
  const sql = `SELECT JSON_EXTRACT(config, '$.labels') AS labels
  FROM companies
  WHERE id = '${companyId}'
  AND is_obsolate = false`;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};
export {
  getCompaniesDao,
  getTerritoriesDao,
  getCompanyByMobile,
  getnegativeStockDao,
  addCompanyDao,
  getCompany,
  updateCompany,
  updateNegativeStockDao,
  getLabelingDao,
  getConfigDao,
};
