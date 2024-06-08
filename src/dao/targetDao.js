import { generateUUID } from '../utils/helper';
import { EVENT_TYPE } from '../utils/constants';

const getOrderApprovedCountDao = async (
  conn,
  payload,
  status,
  lowerLevelId
) => {
  let sql = `SELECT
 COUNT(*) AS row_count FROM user_activities
  WHERE company = '${payload.token.companyId}'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.order_status')) = 'Approved'
    AND MONTH(JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time'))) = '${payload.month}'
    AND YEAR(JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time'))) = '${payload.year}'
    AND is_obsolate = false
 `;
  if (status === false) {
    sql += ` AND user IN ('${lowerLevelId.join("','")}')`;
  }
  const data = await conn.query(sql);

  return data[0];
};

const getRevenueCountDao = async (conn, payload, status, lowerLevelId) => {
  let sql = `SELECT
  SUM(t.achieved_amount) AS revenue_amount
FROM revenue t
JOIN users u ON t.user = u.id
JOIN designations d ON u.designation = d.id
WHERE
  t.company = '${payload.token.companyId}'
  AND MONTH(t.created_at) = '${payload.month}'
  AND YEAR(t.created_at) = '${payload.year}'
  AND t.is_obsolate = false`;
  if (status === false && lowerLevelId) {
    sql += ` AND  u.id IN ('${lowerLevelId.join("','")}')`;
  }
  const data = await conn.query(sql);
  return data[0];
};

const getActivityHistoryCountDao = async (
  conn,
  payload,
  status,
  lowerLevelId
) => {
  let sql = `SELECT COUNT(*) AS row_count
  FROM (
  SELECT event_type, config AS activity, JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) AS start_time
  FROM user_activities
  WHERE company = '${payload.token.companyId}'
    AND event_type IN ('${EVENT_TYPE.order}', '${EVENT_TYPE.reminder}', '${EVENT_TYPE.discussion}')
    AND MONTH(JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time'))) = '${payload.month}'
    AND YEAR(JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time'))) = '${payload.year}'
    AND is_obsolate = false`;
  if (status === false) {
    sql += ` AND user IN ('${lowerLevelId.join("','")}')`;
  }
  sql += `
  UNION
  SELECT event_type, config AS activity, JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) AS start_time
  FROM lead_activities
  WHERE company = '${payload.token.companyId}'
      AND event_type IN ('${EVENT_TYPE.lead_order}', '${EVENT_TYPE.lead_discussion}', '${EVENT_TYPE.lead_reminder}')
    AND MONTH(JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time'))) = '${payload.month}'
    AND YEAR(JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time'))) = '${payload.year}'
    AND is_obsolate = false
) AS merged_data
ORDER BY start_time DESC;`;

  const data = await conn.query(sql);
  return data[0];
};

const getTotalRevenueByMonthDao = async (
  conn,
  payload,
  status,
  lowerLevelId
) => {
  let sql = `SELECT t.total_monthly_targets, r.total_monthly_revenue
  FROM (
    SELECT SUM(target_amount) AS total_monthly_targets
    FROM targets t
    JOIN users u ON t.target_user = u.id
    WHERE t.company = '${payload.token.companyId}'
      AND t.is_obsolate = false
      AND u.is_obsolate = false
      AND t.year = '${payload.year}'
      AND t.month = '${payload.month}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += `) t
  CROSS JOIN (
    SELECT SUM(achieved_amount) AS total_monthly_revenue
    FROM revenue r
    JOIN users u ON r.user = u.id
    WHERE r.company = '${payload.token.companyId}'
      AND r.is_obsolate = false
      AND r.year = '${payload.year}'
      AND r.month = '${payload.month}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += ') r';

  const data = await conn.query(sql);

  return data[0];
};

const getTotalRevenueRegionWiseByMonthDao = async (
  conn,
  payload,
  region,
  status,
  lowerLevelId
) => {
  let sql = `
  SELECT t.total_monthly_targets, r.total_monthly_revenue
  FROM (
      SELECT SUM(target_amount) AS total_monthly_targets
      FROM targets t
      JOIN users u ON t.target_user = u.id
      WHERE t.company = '${payload.token.companyId}'
        AND t.is_obsolate = false
        AND u.is_obsolate = false
        AND t.year = '${payload.year}'
        AND t.month = '${payload.month}'
        AND JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.regionName')) = '${region}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += `
  ) t
  CROSS JOIN (
      SELECT SUM(achieved_amount) AS total_monthly_revenue
      FROM revenue r
      JOIN users u ON r.user = u.id
      WHERE r.company = '${payload.token.companyId}'
        AND r.is_obsolate = false
        AND r.year = '${payload.year}'
        AND r.month = '${payload.month}'
        AND JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.regionName')) = '${region}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += ') r';

  const data = await conn.query(sql);

  return data[0];
};

const getTotalRevenueByYearDao = async (
  conn,
  payload,
  status,
  lowerLevelId
) => {
  let sql = `SELECT t.total_yearly_targets, r.total_yearly_revenue
  FROM (
    SELECT SUM(target_amount) AS total_yearly_targets
    FROM targets t
    JOIN users u ON t.target_user = u.id
    WHERE t.company = '${payload.token.companyId}'
      AND t.is_obsolate = false
      AND u.is_obsolate = false
      AND t.year = '${payload.year}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += `) t
  CROSS JOIN (
    SELECT SUM(achieved_amount) AS total_yearly_revenue
    FROM revenue r
    JOIN users u ON r.user = u.id
    WHERE r.company = '${payload.token.companyId}'
      AND r.is_obsolate = false
      AND r.year = '${payload.year}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += ') r';

  const data = await conn.query(sql);
  return data[0];
};

const getTotalRevenueRegionWiseByYearDao = async (
  conn,
  payload,
  region,
  status,
  lowerLevelId
) => {
  let sql = `SELECT t.total_yearly_targets, r.total_yearly_revenue
  FROM (
    SELECT SUM(target_amount) AS total_yearly_targets
    FROM targets t
    JOIN users u ON t.target_user = u.id
    WHERE t.company = '${payload.token.companyId}'
      AND u.is_obsolate = false
      AND t.is_obsolate = false
      AND t.year = '${payload.year}'
      AND JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.regionName')) = '${region}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += `) t
  CROSS JOIN (
    SELECT SUM(achieved_amount) AS total_yearly_revenue
    FROM revenue r
    JOIN users u ON r.user = u.id
    WHERE r.company = '${payload.token.companyId}'
      AND r.is_obsolate = false
      AND r.year = '${payload.year}'
      AND JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.regionName')) = '${region}'`;

  if (status === false) {
    sql += ` AND u.id IN ('${lowerLevelId.join("','")}')`;
  }

  sql += ') r';

  const data = await conn.query(sql);

  return data[0];
};

const addTargetDao = async (conn, targetObject) => {
  const { source_user, target, month, year } = targetObject.payload;
  const { token } = targetObject;

  await Promise.all(
    target.map(async ({ target_user, target_amount }, index) => {
      const id = `${generateUUID()}-${index}`;
      const sql = `insert into targets(id,source_user,
      target_user,month, year,target_amount,company,
      created_by,updated_by)
      values('${id}','${source_user}','${target_user}',
      '${month}','${year}','${target_amount}',
      '${token.companyId}','${token.userId}','${token.userId}')`;

      await conn.query(sql);
    })
  );
  const data = { success: true };
  return data;
};

const addInitialTargetDao = async (conn, targetObject) => {
  const { source_user, target_user, month, year, target_amount } =
    targetObject.payload;
  const { token } = targetObject;
  const id = generateUUID();
  const sql = `insert into targets(id,source_user,
      target_user,month, year,target_amount,company,
      created_by,updated_by)
      values('${id}','${source_user}','${target_user}',
      '${month}','${year}','${target_amount}',
      '${token.companyId}','${token.userId}','${token.userId}')`;

  await conn.query(sql);
  const data = { success: true };
  return data;
};

const updateTargetDao = async (conn, companyId, payload, target_amount) => {
  const sql = `UPDATE targets AS t
    SET t.target_amount = t.target_amount + ${target_amount} - ${payload.target_amount}
    WHERE t.company = '${companyId}'
    AND t.id = '${payload.id}'
    AND t.source_user = '${payload.source_user}'
    AND t.target_user = '${payload.target_user}'`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const updateTargetByIdDao = async (conn, companyId, id, payload) => {
  const sql = `UPDATE targets AS t
    SET t.target_amount = '${payload.amount}', 
    t.month = '${payload.month}', 
    t.year = '${payload.year}',
    t.updated_by = '${payload.updated_by}'
    WHERE t.company = '${companyId}'
    AND t.id = '${id}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

const getTotalRevenueForMonthByIdDao = async (conn, payload, userId) => {
  const sql = `SELECT
  t.id,
  u.first_name,
  u.last_name,
  t.target_user,
  SUM(t.target_amount) AS total_monthly_targets
FROM targets t
JOIN users u ON t.target_user = u.id
WHERE
  t.target_user IN (${userId})
  AND t.company = '${payload.token.companyId}'
  AND t.is_obsolate = false
  AND t.year = '${payload.year}'
  AND t.month = '${payload.month}'
GROUP BY t.target_user`;

  const sql2 = `SELECT
  u.first_name,
  u.last_name,
  t.user,
  SUM(t.achieved_amount) AS total_monthly_revenue
FROM revenue t
JOIN users u ON t.user = u.id
WHERE
  t.user IN (${userId})
  AND t.company = '${payload.token.companyId}'
  AND t.is_obsolate = false
  AND t.year = '${payload.year}'
  AND t.month = '${payload.month}'
GROUP BY t.user`;

  const data2 = await conn.query(sql2);
  const data = await conn.query(sql);

  const mergedData = data.map((obj) => {
    const matchingObj = data2.find((item) => item.user === obj.target_user);
    return { ...obj, ...matchingObj };
  });
  return mergedData;
};

const getTotalRevenueForYearByIdDao = async (conn, payload, userId) => {
  const sql = `SELECT
  t.id,
  u.first_name,
  u.last_name,
  t.target_user,
  d.designation,
  SUM(t.target_amount) AS total_yearly_targets
FROM targets t
JOIN users u ON t.target_user = u.id
JOIN designations d ON u.designation = d.id
WHERE
  t.target_user IN (${userId})
  AND t.company = '${payload.token.companyId}'
  AND t.is_obsolate = false
  AND t.year = '${payload.year}'
GROUP BY t.target_user`;

  const sql2 = `SELECT
  u.first_name,
  u.last_name,
  t.user,
  d.designation,
  SUM(t.achieved_amount) AS total_yearly_revenue
FROM revenue t
JOIN users u ON t.user = u.id
JOIN designations d ON u.designation = d.id
WHERE
  t.user IN (${userId})
  AND t.company = '${payload.token.companyId}'
  AND t.is_obsolate = false
  AND t.year = '${payload.year}'
GROUP BY t.user`;

  const data2 = await conn.query(sql2);
  const data = await conn.query(sql);
  const mergedData = data.map((obj) => {
    const matchingObj = data2.find((item) => item.user === obj.target_user);
    return { ...obj, ...matchingObj };
  });
  return mergedData;
};

const getTargetListDao = async (conn, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND t.target_amount LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from targets t
  where t.company = '${payload.companyId}'
  AND t.target_amount != "0"  
  AND t.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `SELECT
  t.id AS target_id,
  u.id,
  u.first_name AS assign_to_first_name,
  u.last_name AS assign_to_last_name,
  d.designation,
  s.first_name AS assign_by_first_name,
  s.last_name AS assign_by_last_name,
  JSON_EXTRACT(u.config, '$.regionName') AS region,
  t.month,
  t.year,
  t.target_amount
FROM
  targets t
  JOIN users u ON u.id = t.target_user
  JOIN users s ON s.id = t.source_user
  JOIN designations d ON d.id = u.designation
WHERE
  t.company = '${payload.companyId}'
  AND target_amount != "0"
  AND t.is_obsolate = false
  ${searchCondition}
  order by t.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const targetData = await conn.query(sql);
  return { totalRowsValue, targetData };
};

const childEmployeeCountDao = async (conn, token, userId) => {
  const sql = `
    SELECT
      JSON_UNQUOTE(JSON_EXTRACT(config, '$.designation_id')) AS designation_id,
      CAST(COUNT(JSON_UNQUOTE(JSON_EXTRACT(config, '$.child[*].employees[*]'))) AS CHAR) AS employee_counts
    FROM
      user_hierarchy
    WHERE
      company = '${token.companyId}'
      AND user = '${userId}'
      AND is_obsolate = false
    GROUP BY
      designation_id`;
  const data = await conn.query(sql);
  return data[0];
};

const filterTargetListDao = async (conn, targetObject, targetUser) => {
  const sql = `select
    t.id,
    t.source_user,
    t.target_user,
    t.target_amount,
    u.first_name as assign_to_first_name,
    u.last_name assign_to_last_name,
    d.designation
  from targets t  JOIN users u ON u.id=t.target_user
  JOIN users s ON s.id = t.source_user
  JOIN designations d ON d.id = u.designation
  WHERE
    t.company = '${targetObject.token.companyId}'
    AND t.month = '${targetObject.payload.month}'
    AND t.year = '${targetObject.payload.year}'
    AND t.target_user = '${targetUser}'
    AND t.is_obsolate = false`;
  const data = await conn.query(sql);

  return data[0];
};

const getTargetHierarchyDao = async (conn, token, month, year, userId) => {
  const sql = `SELECT
SUM(t.target_amount) AS monthly_target
FROM targets t
WHERE
  t.target_user = '${userId}'
  AND t.company = '${token.companyId}'
  AND t.is_obsolate = false
  AND t.year = '${year}'
  AND t.month = '${month}'
GROUP BY t.target_user`;
  const data = await conn.query(sql);
  return data;
};

const deleteTargetDao = async (conn, companyId, id) => {
  const sql = `UPDATE targets 
  SET is_obsolate = true
  WHERE id = '${id}' 
  AND company = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

export {
  getTotalRevenueByMonthDao,
  getTotalRevenueRegionWiseByYearDao,
  getTotalRevenueRegionWiseByMonthDao,
  getTotalRevenueByYearDao,
  getActivityHistoryCountDao,
  getRevenueCountDao,
  getOrderApprovedCountDao,
  addTargetDao,
  updateTargetDao,
  getTotalRevenueForMonthByIdDao,
  getTotalRevenueForYearByIdDao,
  getTargetListDao,
  childEmployeeCountDao,
  filterTargetListDao,
  updateTargetByIdDao,
  getTargetHierarchyDao,
  addInitialTargetDao,
  deleteTargetDao,
};
