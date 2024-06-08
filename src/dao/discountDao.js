import { generateUUID } from '../utils/helper';

const getDiscountsLimitDao = async (conn, companyId, payload, offset) => {
  const sql = `SELECT 
  d.id,
  d.based,
  d.config,
  d.discount
FROM discounts d
  WHERE d.company = '${companyId}'
  AND d.is_obsolate = false
  order by d.${payload.column} ${payload.sort} 
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getAllDiscountsDao = async (conn, companyId, payload) => {
  const sql = `SELECT 
  d.id,
  d.based,
  d.config,
  d.discount
FROM discounts d
  WHERE d.company = '${companyId}'
  AND d.is_obsolate = false
  order by d.${payload.column} ${payload.sort} `;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getAllDiscountProductBasedDao = async (conn, companyId) => {
  const sql = `SELECT
  d.based AS 'discount_based',
  CASE
    JSON_UNQUOTE(JSON_EXTRACT(d.config, '$.type'))
    WHEN 'product' THEN 'product type'
    ELSE NULL
  END AS 'discount_type',
  p.product_name,
  p.product_hsncode,
  d.discount AS 'Discount(%)',
  CONCAT(u.first_name, ' ', u.last_name) AS 'vendor_name'
FROM
  discounts d
  JOIN products p ON JSON_UNQUOTE(JSON_EXTRACT(d.config, '$.products[0]')) = p.id
  JOIN users u ON JSON_CONTAINS(d.config, JSON_QUOTE(u.id), '$.vendors')
WHERE
  d.based = 'product_based'
  AND d.company = '${companyId}'
  AND d.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getAllDiscountVendorBasedDao = async (conn, companyId) => {
  const sql = `SELECT
  d.based AS 'discount_based',
  CASE JSON_UNQUOTE(JSON_EXTRACT(d.config, '$.type'))
    WHEN 'vendor' THEN 'vendor type'
    ELSE NULL
  END AS 'discount_type',
  d.discount AS 'Discount(%)',
  CONCAT(u.first_name, ' ', u.last_name) AS 'vendor_name',
  JSON_UNQUOTE(JSON_EXTRACT(d.config, '$.vendors[0]')) AS 'vendor_id'
FROM
  discounts d
JOIN
  users u ON JSON_CONTAINS(d.config, JSON_QUOTE(u.id), '$.vendors')
WHERE
  d.based = 'vendor_based'
  AND d.company = '${companyId}'
  AND d.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getDiscountByIdDao = async (conn, companyId, id) => {
  const sql = `SELECT 
  d.id,
  d.based,
  d.config,
  d.discount
  FROM discounts d
  WHERE d.company = '${companyId}'
  AND d.id = '${id}'
  AND d.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const addDiscountDao = async (conn, company, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `insert into discounts ( id, based, config, company, discount )
  values ( '${id}', '${payload.based}','${config}', '${company}', ${payload.discount} )
  RETURNING discounts.id `;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const updateDiscountDao = async (conn, company, id, payload) => {
  const config = JSON.stringify(payload.config);
  const sql = `UPDATE discounts SET based = '${payload.based}', config = '${config}', 
  discount = ${payload.discount} WHERE company = '${company}' and id = '${id}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

const deleteDiscountDao = async (conn, id, company) => {
  const sql = `UPDATE discounts
    SET is_obsolate = true
    WHERE discounts.id = '${id}'
    AND discounts.company = '${company}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

export {
  getAllDiscountsDao,
  getDiscountsLimitDao,
  getAllDiscountProductBasedDao,
  getAllDiscountVendorBasedDao,
  getDiscountByIdDao,
  addDiscountDao,
  updateDiscountDao,
  deleteDiscountDao,
};
