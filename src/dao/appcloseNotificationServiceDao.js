import { START_DAY } from '../utils/constants';

const getEmployeeStartDayDao = async (conn, todayDate) => {
  const sql = `
            SELECT user 
            FROM user_activities 
            WHERE event_type = '${START_DAY}'
            AND created_at = '${todayDate}';
            
        `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};
const getAppCloseEmployeeList = async (conn, data) => {
  if (!data || data.length === 0) {
    return undefined;
  }
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() - 22);
  const ids = data.map((item) => `'${item.user}'`).join(',');
  const sql = `
      SELECT user 
      FROM user_activities 
      WHERE event_type = '15min'
      AND user IN (${ids})
      AND created_at >= DATE_SUB('${currentTime.toISOString()}', INTERVAL 22 MINUTE);
  `;
  const result = await conn.query(sql);
  if (result && result.length === 0) {
    return data;
  }
  return undefined;
};
const getFcmTokenDao = async (conn, data) => {
  const ids = data.map((item) => `'${item.user}'`).join(',');
  const sql = `SELECT JSON_EXTRACT(config, '$.fcmToken') as fcmToken 
                   FROM login 
                   WHERE username IN (${ids})`;
  const fcmToken = await conn.query(sql);
  if (fcmToken && fcmToken.length === 0) {
    return fcmToken;
  }
  return undefined;
};

export { getEmployeeStartDayDao, getAppCloseEmployeeList, getFcmTokenDao };
