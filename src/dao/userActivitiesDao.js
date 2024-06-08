import { generateUUID } from '../utils/helper';

const getVendorOrderByIdDao = async (
  conn,
  companyId,
  id,
  startDate,
  endDate
) => {
  const sql = `select
  a.id,
  a.event_type,
  a.config,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
from
  user_activities as a
  join users as u on a.user = u.id
where a.company = '${companyId}'
and a.event_type = 'order'
and JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.buyer_id')) = '${id}'
and JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) >= '${startDate} 00:00:00'
and JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) <= '${endDate} 23:59:59'
and a.is_obsolate = false
order by a.created_at DESC`;

  const data = await conn.query(sql);

  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getVendorCompetitorStockByIdDao = async (conn, companyId, id) => {
  const sql = `select
  a.id,
  a.event_type,
  a.config,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
from
  user_activities as a
  join users as u on a.user = u.id
where a.company = '${companyId}'
and a.event_type = 'competitor_stock'
and JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.vendor')) = '${id}'
and a.is_obsolate = false
order by a.created_at DESC`;

  const data = await conn.query(sql);

  if (data && data[0]) {
    return data;
  }
  return undefined;
};
const getVendorOwnStockByIdDao = async (conn, companyId, id) => {
  const sql = `select
  a.id,
  a.event_type,
  a.config,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
from
  user_activities as a
  join users as u on a.user = u.id
where a.company = '${companyId}'
and a.event_type = 'own_stock'
and JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.vendor')) = '${id}'
and a.is_obsolate = false
order by a.created_at DESC`;
  const data = await conn.query(sql);

  if (data && data[0]) {
    return data;
  }
  return undefined;
};


const getUserActivitiesDao = async (conn, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND a.event_type LIKE '%${payload.searchText}%'`;
  }
  const sql = `SELECT
    a.id,
    a.event_type,
    a.config,
    CONCAT(u.first_name, ' ', u.last_name) as employee,
    u.contact_no,
    DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
  FROM
    user_activities AS a
    JOIN users AS u ON a.user = u.id
  WHERE
    a.company = '${payload.companyId}'
    AND a.user = '${payload.id}'
    AND a.event_type = '${payload.event_type}'
    AND a.is_obsolate = false 
    ${searchCondition}
  UNION
  SELECT
    a.id,
    a.event_type,
    a.config,
    CONCAT(u.first_name, ' ', u.last_name) as employee,
    u.contact_no,
    DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
  FROM
    lead_activities AS a
    JOIN users AS u ON a.updated_by = u.id
  WHERE
    a.company = '${payload.companyId}'
    AND a.updated_by = '${payload.id}'
    AND a.event_type = '${payload.event_type_lead}'
    AND a.is_obsolate = false 
  ORDER BY date DESC
  LIMIT ${payload.limit} OFFSET ${offset}
  `;

  const data = await conn.query(sql);

  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const discussionOrReminderByIdDao = async (conn, payload) => {
  const sql = `select
  a.id,
  a.event_type,
  a.config,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
from
  user_activities as a
  join users as u on a.user = u.id
  where a.company = '${payload.companyId}'
  and a.user = '${payload.userId}'
  and json_contains(a.config, '{ "buyer_id" : "${payload.id}" }')
  and a.event_type = '${payload.event_type}'
  and a.is_obsolate = false
  ORDER BY JSON_EXTRACT(a.config, '$.start_time') DESC`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getUserActivitiesFilterDao = async (conn, payload, offset) => {
  const sql = `SELECT
    a.id,
    a.event_type,
    a.config,
    CONCAT(u.first_name, ' ', u.last_name) as employee,
    u.contact_no,
    DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
  FROM
    user_activities AS a
    JOIN users AS u ON a.user = u.id
  WHERE
    a.company = '${payload.companyId}'
    AND a.user = '${payload.id}'
    AND a.event_type = '${payload.event_type}'
    AND a.created_at BETWEEN '${payload.startDate} 00:00:00' AND '${payload.endDate} 23:59:59'
    AND a.is_obsolate = false 
  UNION
  SELECT
    a.id,
    a.event_type,
    a.config,
    CONCAT(u.first_name, ' ', u.last_name) as employee,
    u.contact_no,
    DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
  FROM
    lead_activities AS a
    JOIN users AS u ON a.updated_by = u.id
  WHERE
    a.company = '${payload.companyId}'
    AND a.updated_by = '${payload.id}'
    AND a.event_type = '${payload.event_type_lead}'
    AND a.created_at BETWEEN '${payload.startDate} 00:00:00' AND '${payload.endDate} 23:59:59'
    AND a.is_obsolate = false 
  ORDER BY date DESC
    LIMIT ${payload.limit} OFFSET ${offset}`;

  const data = await conn.query(sql);

  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getOrderListDao = async (conn, payload, offset, status, lowerLevelId) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND a.event_type LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select (SELECT COUNT(*) FROM (
      SELECT a.id FROM user_activities AS a
      JOIN users AS u ON a.user = u.id
      WHERE a.company = '${payload.companyId}'
      AND a.event_type = 'order'
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND a.is_obsolate = false
      ${searchCondition}
      UNION ALL
      SELECT l.id FROM lead_activities AS l
      JOIN users AS u ON l.updated_by = u.id
      WHERE l.company = '${payload.companyId}'
      AND l.event_type = 'lead_order'
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND l.is_obsolate = false
    ) AS total_rows) AS totalRows 
`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `
  SELECT * FROM (
    SELECT
      a.id,
      a.event_type,
      a.config,
      CONCAT(u.first_name, ' ', u.last_name) AS employee,
      u.contact_no,
      DATE_FORMAT(a.created_at, '%d/%m/%Y') AS date
    FROM
      user_activities AS a
      JOIN users AS u ON a.user = u.id
    WHERE
      a.company = '${payload.companyId}'
      AND a.event_type = 'order'
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND a.is_obsolate = false
      ${searchCondition}
    UNION ALL
    SELECT
      l.id,
      l.event_type,
      l.config,
      CONCAT(u.first_name, ' ', u.last_name) AS employee,
      u.contact_no,
      DATE_FORMAT(l.created_at, '%d/%m/%Y') AS date
    FROM
      lead_activities AS l
      JOIN users AS u ON l.updated_by = u.id
    WHERE
      l.company = '${payload.companyId}'
      AND l.event_type = 'lead_order'
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND l.is_obsolate = false
  ) AS combined_queries
  ORDER BY date ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}
`;

  const order = await conn.query(sql);
  if (order && order[0]) {
    return { totalRowsValue, order };
  }
  return undefined;
};

const getOrderByStatusDao = async (
  conn,
  payload,
  offset,
  status,
  lowerLevelId
) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND a.event_type LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select (SELECT COUNT(*) FROM (
      SELECT a.id FROM user_activities AS a
      JOIN users AS u ON a.user = u.id
      WHERE a.company = '${payload.companyId}'
      AND a.event_type = 'order'
      AND JSON_CONTAINS(a.config, '{ "order_status" : "${payload.status}" }')
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND a.is_obsolate = false
      ${searchCondition}
      UNION ALL
      SELECT l.id FROM lead_activities AS l
      JOIN users AS u ON l.updated_by = u.id
      WHERE l.company = '${payload.companyId}'
      AND l.event_type = 'lead_order'
      AND JSON_CONTAINS(l.config, '{ "order_status" : "${payload.status}" }')
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND l.is_obsolate = false
    ) AS total_rows) AS totalRows 
`;

  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);
  const employeekey = [];
  let sql = `
  SELECT * FROM (
    SELECT
      a.id,
      a.event_type,
      a.config,
      CONCAT(u.first_name, ' ', u.last_name) AS employee,
      u.contact_no,
      DATE_FORMAT(a.created_at, '%d/%m/%Y') AS date
    FROM
      user_activities AS a
      JOIN users AS u ON a.user = u.id
    WHERE
      a.company = '${payload.companyId}'
      AND a.event_type = 'order'
      AND JSON_CONTAINS(a.config, '{ "order_status" : "${payload.status}" }')
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND a.is_obsolate = false
      ${searchCondition}`;

  if (status === false) {
    if (lowerLevelId && lowerLevelId.length > 0) {
      const placeholders = Array(lowerLevelId.length).fill('?').join(',');
      sql += ` AND u.id IN (${placeholders})`;
      employeekey.push(...lowerLevelId);
    } else {
      return undefined;
    }
  }

  sql += ` UNION ALL
    SELECT
      l.id,
      l.event_type,
      l.config,
      CONCAT(u.first_name, ' ', u.last_name) AS employee,
      u.contact_no,
      DATE_FORMAT(l.created_at, '%d/%m/%Y') AS date
    FROM
      lead_activities AS l
      JOIN users AS u ON l.updated_by = u.id
    WHERE
      l.company = '${payload.companyId}'
      AND l.event_type = 'lead_order'
      AND JSON_CONTAINS(l.config, '{ "order_status" : "${payload.status}" }')
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) >= '${payload.startDate} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(l.config, '$.start_time')) <= '${payload.endDate} 23:59:59'
      AND l.is_obsolate = false
  ) AS combined_queries
  ORDER BY date ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;

  const order = await conn.query(sql, employeekey);
  if (order && order[0]) {
    return { totalRowsValue, order };
  }
  return undefined;
};

const getUserActivitiesByIdDao = async (conn, payload) => {
  const sql = `select
  a.id,
  a.event_type,
  a.config,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  MONTH(a.created_at) AS month,
  YEAR(a.created_at) AS year
from
  user_activities as a
  join users as u on a.user = u.id
  where a.company = '${payload.token.companyId}'
  and a.id = '${payload.id}'
  and a.is_obsolate = false
  `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateUserActivitiesDao = async (conn, companyId, id, config) => {
  const configData = JSON.stringify(config);
  const sql = `update user_activities
  set config = '${configData}' where company = '${companyId}' and id = '${id}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const order = { ...data[0] };
    return order;
  }
  return undefined;
};

const deleteUserActivitiesDao = async (conn, companyId, orderId) => {
  const sql = `update user_activities set is_obsolate = true where id = '${orderId}' and company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const order = { ...data[0] };
    return order;
  }
  return undefined;
};

const changeOrderStatusDao = async (conn, payload) => {
  const sql = `update user_activities 
  set config = json_set(config, '$.order_status' , '${payload.status}', '$.reason', '${payload.reason}' )
  WHERE id = '${payload.id}'
  AND company = '${payload.token.companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

const confirmOrderDao = async (conn, payload) => {
  const id = generateUUID();
  const sql = `insert into revenue (id, user, month, year, achieved_amount, created_by, updated_by, company)
    values('${id}', '${payload.user}', '${payload.month}', '${payload.year}','${payload.amount}', '${payload.token.userId}',
    '${payload.token.userId}','${payload.token.companyId}')`;
  const data = await conn.query(sql);
  return data;
};

const reminderCronJobDao = async (conn, dateformat) => {
  const sql = `SELECT
  a.user,
  a.config,
  a.event_type,
  a.company,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  DATE_FORMAT(a.created_at, '%d/%m/%Y') as date
FROM
  user_activities AS a
  JOIN users AS u ON a.user = u.id
WHERE
  DATE_FORMAT(
    STR_TO_DATE(
      JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.followup_date')),
      '%Y-%m-%d %H:%i:%s'
    ),
    '%Y-%m-%d'
  ) = '${dateformat}'
  AND a.event_type = 'reminder'
ORDER BY
  a.created_at DESC;`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getStartDateDao = async (conn, start, dateformat, id) => {
  const sql = `SELECT
    a.user,
    a.event_type,
    a.created_at
  FROM
    user_activities AS a
    JOIN users AS u ON a.user = u.id
  WHERE
    DATE(a.created_at) = '${dateformat}'
    and a.event_type = '${start}'
    and u.id = '${id}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

export {
  getUserActivitiesDao,
  discussionOrReminderByIdDao,
  getUserActivitiesFilterDao,
  getOrderByStatusDao,
  getOrderListDao,
  getUserActivitiesByIdDao,
  updateUserActivitiesDao,
  deleteUserActivitiesDao,
  changeOrderStatusDao,
  confirmOrderDao,
  reminderCronJobDao,
  getVendorOrderByIdDao,
  getStartDateDao,
  getVendorCompetitorStockByIdDao,
  getVendorOwnStockByIdDao,
  
};
