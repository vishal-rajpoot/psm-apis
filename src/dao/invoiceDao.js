import { generateUUID } from '../utils/helper';

const getAllInvoiceDao = async (conn, companyId, year) => {
  const sql = `SELECT i.id,
  i.invoice_number, 
  i.config
  FROM invoices i
  WHERE company = '${companyId}'
  AND is_obsolate = false
  AND JSON_UNQUOTE(JSON_EXTRACT(i.config, '$.financial_year')) = ${year}
  ORDER BY i.created_at DESC`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getInvoicePrefixDao = async (conn, companyId) => {
  const sql = `SELECT config as invoice_no
  FROM companies
  WHERE JSON_EXTRACT(config, '$.invoice') IS NOT NULL
  AND id = '${companyId}'
  AND is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const addInvoicePrefixDao = async (conn, companyId, payload) => {
  const { invoice } = payload;
  const sql = `UPDATE companies SET config = JSON_SET(
    config,
    '$.invoice',
    JSON_ARRAY(${invoice.map((value) => JSON.stringify(value)).join(',')})
  )
    WHERE id = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};

const addInvoiceDao = async (conn, companyId, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload);
  const sql = `INSERT INTO invoices (id, invoice_number, config, company) VALUES ( '${id}','${payload.invoice_number}','${config}','${companyId}') RETURNING invoices.id`;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};

const updateInvoiceDao = async (conn, id, companyId, payload) => {
  const config = JSON.stringify(payload);
  const sql = `UPDATE invoices SET config = '${config}' 
  WHERE id = '${id}' 
  AND company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};

const deleteInvoiceDao = async (conn, companyId, id) => {
  const sql = `UPDATE invoices SET is_obsolate = true 
  WHERE id = '${id}'
  AND company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const getInvoiceYearDao = async (conn, companyId) => {
  const sql = `SELECT c.created_at
  FROM companies as c
  WHERE id = '${companyId}'
  and is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

export {
  getAllInvoiceDao,
  getInvoicePrefixDao,
  addInvoicePrefixDao,
  addInvoiceDao,
  updateInvoiceDao,
  deleteInvoiceDao,
  getInvoiceYearDao,
};
