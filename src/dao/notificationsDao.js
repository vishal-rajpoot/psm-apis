import { generateUUID } from '../utils/helper';
import { LOGIN } from '../utils/constants';

const addPushNotificationDao = async (conn, title, body, token) => {
  const id = generateUUID();
  const sql = `insert into notifications(id, user, title, message, company)
  values('${id}', '${token.userId}', '${title}', '${body}', '${token.companyId}')`;
  const data = await conn.query(sql);
  return data[0];
};

const getNotificationsDao = async (conn, token) => {
  const sql = `select n.id, n.title, n.message, n.created_at from notifications n
  where n.user = '${token.userId}' and n.company = '${token.companyId}'`;
  const data = await conn.query(sql);

  return data;
};
const getHolidaysDao = async (conn, companyId) => {
  const sql =
    'SELECT * FROM holidays WHERE company = ? AND is_obsolate = false';
  const data = await conn.query(sql, [companyId]);
  const configSql = 'SELECT config FROM companies WHERE id = ?';
  const configResult = await conn.query(configSql, [companyId]);
  const { notificationTime } = configResult[0].config;
  const result = {
    data,
    notificationTime,
  };

  return result;
};

const addNotificationTimeDao = async (conn, companyId, notificationTime) => {
  const updateConfigSql =
    'UPDATE companies SET config = JSON_SET(config, "$.notificationTime", ?) WHERE id = ?';
  const data = await conn.query(updateConfigSql, [notificationTime, companyId]);
  return data[0];
};

const addHolidaysDao = async (conn, companyId, holidays) => {
  const id = generateUUID();
  const sql =
    'INSERT INTO holidays (id, holiday, is_obsolate, company) VALUES (?, ?, ?, ?)';
  const data = await conn.query(sql, [id, holidays, false, companyId]);
  return data[0];
};

const getFcmTokenDao = async (conn, token) => {
  const sql = `select JSON_EXTRACT(config, '$.fcmToken') as fcmToken FROM login
  where username = '${token.userId}'
  and company = '${token.companyId}'
  and (event IS NULL OR event = '${LOGIN}')
  order by created_at DESC LIMIT 1`;
  const data = await conn.query(sql);
  return data[0];
};

const deleteHolidaysDao = async (conn, companyId, id) => {
  const sql = `UPDATE holidays 
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
  addPushNotificationDao,
  getNotificationsDao,
  getFcmTokenDao,
  addNotificationTimeDao,
  addHolidaysDao,
  deleteHolidaysDao,
  getHolidaysDao,
};
