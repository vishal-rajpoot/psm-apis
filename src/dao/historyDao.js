const getTrackingHistoryDao = async (conn, date, user, companyId) => {
  const sql = `select tracking_date, config as tracking
    FROM user_tracking
    WHERE user = '${user}'
    and company = '${companyId}'
    and tracking_date = '${date}'`;
  const data = await conn.query(sql);

  return data;
};

const getOrderApprovedCountDao = async (conn, date, user, companyId) => {
  const sql = `SELECT
 COUNT(*) AS row_count FROM user_activities
  WHERE company = '${companyId}'
    AND user = '${user}'
    AND event_type = 'order'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.order_status')) = 'Approved'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) >= '${date} 00:00:00'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) <= '${date} 23:59:59'
 `;
  const data = await conn.query(sql);
  return data[0];
};

const getRevenueCountDao = async (conn, date, user, companyId) => {
  const sql = `SELECT
  SUM(t.achieved_amount) AS revenue_amount
FROM revenue t
JOIN users u ON t.user = u.id
JOIN designations d ON u.designation = d.id
WHERE
  t.user = '${user}'
  AND t.company = '${companyId}'
  AND t.is_obsolate = false
  AND t.created_at between '${date} 00:00:00' and '${date} 23:59:59'
GROUP BY t.user`;
  const data = await conn.query(sql);

  return data[0];
};

const getActivityHistoryDao = async (conn, date, user, companyId) => {
  const sql = `SELECT event_type, activity
  FROM (
    SELECT event_type, config AS activity, JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) AS start_time
    FROM user_activities
    WHERE user = '${user}'
      AND company = '${companyId}'
      AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) >= '${date} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) <= '${date} 23:59:59'
    UNION
    SELECT event_type, config AS activity, JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) AS start_time
    FROM lead_activities
    WHERE updated_by = '${user}'
      AND company = '${companyId}'
      AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) >= '${date} 00:00:00'
      AND JSON_UNQUOTE(JSON_EXTRACT(config, '$.start_time')) <= '${date} 23:59:59'
  ) AS merged_data
  ORDER BY start_time asc`;

  const data = await conn.query(sql);
  return data;
};

export {
  getTrackingHistoryDao,
  getActivityHistoryDao,
  getOrderApprovedCountDao,
  getRevenueCountDao,
};
