import { START_DAY } from '../utils/constants';

const getRandomImageDao = async (conn, companyId) => {
  const sql = `SELECT JSON_EXTRACT(config, '$.random_image') AS random_image
    FROM companies
    WHERE id = '${companyId}'
    AND is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const updateRandomImageDao = async (conn, payload, companyId) => {
  const sql = `UPDATE companies
  SET config = JSON_SET(config, '$.random_image', ${payload.random_image})
  WHERE id = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

const storeDao = async (conn, img, companyId, userId, currentDate) => {
  const sql = `UPDATE user_activities
  SET config = JSON_SET(
    config,
    '$[0].random_selfies',
    JSON_ARRAY_APPEND(
      IFNULL(JSON_EXTRACT(config, '$[0].random_selfies'), '[]'),
      '$',
      '${img}'
    )
  )
  WHERE company = '${companyId}'
  AND user = '${userId}'
  AND event_type = '${START_DAY}' 
  AND DATE(updated_at) = '${currentDate}'
  `;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

export { getRandomImageDao, updateRandomImageDao, storeDao };
