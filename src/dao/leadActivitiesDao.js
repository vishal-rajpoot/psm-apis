import { generateUUID } from '../utils/helper';
import { PENDING } from '../utils/constants';

const addLeadActivitiesDao = async (conn, token, lead, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `insert into lead_activities (id, lead, event_type, config, company, created_by, updated_by) values ( '${id}', '${lead}', '${payload.event_type}', '${config}', '${token.companyId}',
  '${token.userId}', '${token.userId}')`;
  const data = await conn.query(sql);
  return data[0];
};

const getAllLeadActivitiesByIdDao = async (
  conn,
  lead,
  token,
  event_type,
  payload,
  offset
) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND la.event_type LIKE '%${payload.searchText}%'`;
  }
  const sql = `select la.id as activity_id,
    la.lead as lead_id,
    la.config
    FROM lead_activities as la
    WHERE la.lead = '${lead}'
    and la.event_type = '${event_type}'
    AND la.company = '${token.companyId}'
    AND la.is_obsolate = false
    ${searchCondition}
    order by la.${payload.column} ${payload.sort}
    LIMIT ${payload.limit} OFFSET ${offset}`;
  const data = await conn.query(sql);

  return data;
};

const updateLeadStatusDao = async (conn, token, lead) => {
  const sql = `update leads
  SET status = '${PENDING}', updated_by = '${token.userId}'
  WHERE leads.id = '${lead}'
  AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const getLeadActivitiesByUserDao = async (conn, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND lead_activities.event_type LIKE '%${payload.searchText}%'`;
  }
  const sql = `select * from lead_activities
    WHERE event_type = '${payload.event_type}'
    AND created_by = '${payload.id}'
    AND company = '${payload.token.companyId}'
    AND is_obsolate = false
    ${searchCondition}
    order by lead_activities.${payload.column} ${payload.sort}
    LIMIT ${payload.limit} OFFSET ${offset}`;
  const data = await conn.query(sql);

  return data;
};

const getAllLeadActivitiesByLeadIdDao = async (conn, lead, token) => {
  const sql = `select la.id as activity_id,
    la.lead as lead_id,
    la.config,
    la.event_type
    FROM lead_activities as la
    WHERE la.lead = '${lead}'
    AND la.company = '${token.companyId}'
    AND la.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const addActivitiesDao = async (
  conn,
  userId,
  companyId,
  config,
  event_type
) => {
  const configData = JSON.stringify(config);
  const id = generateUUID();
  const sql = `INSERT INTO user_activities (id,user,event_type, config,company)
    VALUES ('${id}', '${userId}','${event_type}','${configData}','${companyId}')
    RETURNING user_activities.id`;
  const data = await conn.query(sql);
  return data[0];
};

const deleteLeadActivitiesDao = async (conn, Id, token) => {
  const sql = `UPDATE lead_activities
    SET is_obsolate = true,
    updated_by = '${token.userId}'
    where id = '${Id}'
    AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const updateOrderStatusLeadActivitiesDao = async (conn, payload) => {
  const sql = `update lead_activities 
  set config = json_set(config, '$.order_status' , '${payload.status}', '$.reason', '${payload.reason}'),
  updated_by = '${payload.token.userId}'
  WHERE id = '${payload.id}'
  AND company = '${payload.token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const getLeadActivitiesByIdDao = async (conn, payload) => {
  const sql = `select la.id as activity_id,
    la.lead as lead_id,
    la.config,
    MONTH(la.created_at) AS month,
    YEAR(la.created_at) AS year
    FROM lead_activities as la
    WHERE la.id = '${payload.id}'
    AND la.company = '${payload.token.companyId}'
    AND la.is_obsolate = false`;
  const data = await conn.query(sql);
  return data;
};

const updateProductQtyDao = async (conn, token, product) => {
  const sql = `UPDATE products
  SET updated_by = '${token.userId}',
  quantity = IF(quantity >= ${product.quantity}, quantity - ${product.quantity}, quantity)
  WHERE products.id = '${product.product_id}'
  AND products.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

export {
  addLeadActivitiesDao,
  getAllLeadActivitiesByIdDao,
  updateLeadStatusDao,
  getLeadActivitiesByUserDao,
  getAllLeadActivitiesByLeadIdDao,
  addActivitiesDao,
  deleteLeadActivitiesDao,
  updateOrderStatusLeadActivitiesDao,
  getLeadActivitiesByIdDao,
  updateProductQtyDao,
};
