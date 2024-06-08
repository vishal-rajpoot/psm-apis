import { generateUUID } from '../utils/helper';
import {
  END_DAY,
  START_DAY,
  EMP_ON_LEAVE,
  NOT_IN_YET,
  ABSENT,
} from '../utils/constants';

const startDayDao = async (conn, config, token) => {
  const id = generateUUID();
  const configData = JSON.stringify(config);
  const sql = `insert into user_activities (id, user, event_type, config, company)
    values ('${id}', '${token.userId}', '${START_DAY}', '${configData}', '${token.companyId}' )
    RETURNING user_activities.id`;
  await conn.query(sql);
  const selectSql = `SELECT id FROM user_activities
  WHERE id = (
    SELECT id FROM user_activities
    WHERE user = '${token.userId}'
      AND company = '${token.companyId}'
      AND event_type = '${START_DAY}'
      AND DATE(created_at) = CURDATE()
    LIMIT 1
  );
  `;
  const data = await conn.query(selectSql);
  return data[0];
};

const endDayDao = async (conn, config, token) => {
  const id = generateUUID();
  const configData = JSON.stringify(config);
  const sql = `insert into user_activities (id, user, event_type, config, company)
    values ('${id}', '${token.userId}', '${END_DAY}', '${configData}', '${token.companyId}' )
    RETURNING user_activities.id`;
  const data = await conn.query(sql);
  return data[0];
};

const getAttendanceDao = async (conn, date, token) => {
  const sql = `select JSON_EXTRACT(config, '$.is_vehicle') AS is_vehicle,
  '${START_DAY}' AS is_start
  from user_activities
  where DATE(created_at) = '${date}'
  and user = '${token.userId}'
  and company = '${token.companyId}'
  and event_type =  '${START_DAY}'`;
  const data = await conn.query(sql);

  return data[0];
};
const getAllAttendanceByFilterDao = async (
  conn,
  companyId,
  startDateformatted,
  endFormattedDate,
  payload,
  offset
) => {
  const countSql = `select COUNT(*) as totalRows 
  from user_activities as a
  where company = '${companyId}'
  and a.created_at between '${startDateformatted} 00:00:00' and '${endFormattedDate} 23:59:59'
  and event_type IN ('${END_DAY}', '${START_DAY}', '${EMP_ON_LEAVE}', '${NOT_IN_YET}', '${ABSENT}')
  AND is_obsolate = false`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select
  a.id,
  d.designation,
  c.name as company,
  r.role,
  a.event_type,
  a.config,
  JSON_EXTRACT(u.config, '$.employeeCode') AS employee_code,
  JSON_EXTRACT(u.config, '$.location') AS location,
  JSON_EXTRACT(u.config, '$.state') AS state,
  u.id as employee_id,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  DATE_FORMAT(a.created_at, '%Y-%m-%d') as date
from
  user_activities as a
  join users as u on a.user = u.id
  join designations as d on u.designation = d.id
  join roles as r on u.role = r.id
  join companies as c on c.id = a.company
where a.company = '${companyId}'
  and a.created_at between '${startDateformatted} 00:00:00' and '${endFormattedDate} 23:59:59'
  and event_type IN ('${END_DAY}', '${START_DAY}', '${EMP_ON_LEAVE}', '${NOT_IN_YET}', '${ABSENT}')
  and u.is_obsolate = false
  order by a.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;

  const users = await conn.query(sql);

  if (users && users[0]) {
    return { totalRowsValue, users };
  }
  return undefined;
};

const getAllAttendanceDao = async (
  conn,
  companyId,
  startDateformatted,
  endFormattedDate
) => {
  const countSql = `select COUNT(*) as totalRows 
  from user_activities as a
  where a.company = '${companyId}'
  and a.created_at between '${startDateformatted} 00:00:00' and '${endFormattedDate} 23:59:59'
  and event_type IN ('${END_DAY}', '${START_DAY}', '${EMP_ON_LEAVE}', '${NOT_IN_YET}', '${ABSENT}')
  AND is_obsolate = false`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select
  a.id,
  d.designation,
  c.name as company,
  r.role,
  a.event_type,
  a.config,
  JSON_EXTRACT(u.config, '$.employeeCode') AS employee_code,
  JSON_EXTRACT(u.config, '$.location') AS location,
  JSON_EXTRACT(u.config, '$.state') AS state,
  u.id as employee_id,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  DATE_FORMAT(a.created_at, '%Y-%m-%d') as date
from
  user_activities as a
  join users as u on a.user = u.id
  join designations as d on u.designation = d.id
  join roles as r on u.role = r.id
  join companies as c on c.id = a.company
where a.company = '${companyId}'
  and a.created_at between '${startDateformatted} 00:00:00' and '${endFormattedDate} 23:59:59'
  and event_type IN ('${END_DAY}', '${START_DAY}', '${EMP_ON_LEAVE}', '${NOT_IN_YET}', '${ABSENT}')
  and u.is_obsolate = false
  order by a.created_at DESC
  `;

  const users = await conn.query(sql);
  if (users && users[0]) {
    return { totalRowsValue, users };
  }
  return undefined;
};

const getTrackingDao = async (conn, companyId, user, date) => {
  const sql = `select
    DATE_FORMAT(tracking_date, '%d/%m/%Y') as date,
    user,
   config as tracking
    FROM user_tracking
    WHERE user = '${user}'
    and company = '${companyId}'
    and tracking_date between '${date}' and '${date}'
    `;

  const data = await conn.query(sql);

  return data;
};

// revisit
const checkDayDao = async (conn, date, token) => {
  const sql = `select JSON_EXTRACT(config, '$.is_flag') AS is_day
  from user_activities
  where user = '${token.userId}'
  AND event_type IN ('${START_DAY}', '${END_DAY}')
  and DATE(created_at) = '${date}'
  and company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }

  return undefined;
};

const checkLeaveDao = async (conn, date, token) => {
  const sql = `SELECT JSON_EXTRACT(config, '$.is_leave') AS is_leave
  FROM user_activities
  where user = '${token.userId}'
  and event_type = '${EMP_ON_LEAVE}'
  and DATE(created_at) = '${date}'
  and company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data[0];
};

const addLeaveDao = async (conn, payload, token) => {
  const id = generateUUID();
  const configData = JSON.stringify(payload.config);
  const sql = `insert into user_activities (id, user, event_type, config, company)
    values ('${id}', '${token.userId}', '${EMP_ON_LEAVE}', '${configData}', '${token.companyId}')
    RETURNING user_activities.id`;
  const data = await conn.query(sql);
  return data[0];
};

const checkEventType = async (conn, token, currentDate) => {
  const sql = `SELECT event_type,
  created_at
  FROM user_activities
  where user = '${token.userId}'
  and event_type = '${NOT_IN_YET}' 
  and DATE(created_at) = '${currentDate}'
  and company = '${token.companyId}'
  and is_obsolate = false`;
  const data = await conn.query(sql);

  return data[0];
};

const cronAbsentDao = async (conn, payload, token) => {
  const configData = JSON.stringify(payload);
  const sql = `UPDATE user_activities 
  SET event_type = '${ABSENT}', config = '${configData}'
  WHERE user = '${token.userId}' 
    AND company = '${token.companyId}'
    AND event_type = '${NOT_IN_YET}'
    AND DATE(created_at) = CURDATE()
  `;
  const data = await conn.query(sql);
  return data[0];
};

const cronEndDayDao = async (conn, config) => {
  const id = generateUUID();
  const configData = JSON.stringify(config);
  const sql = `insert into user_activities (id, event_type, config)
    values ('${id}', '${END_DAY}', '${configData}')
    RETURNING user_activities.id`;
  const data = await conn.query(sql);
  return data[0];
};

const getEmployeeRolesIdDao = async (conn) => {
  const sql = `select r.id,
    r.role,
    r.company
    from
    roles as r
    where r.role = 'employee'
    and r.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getUsersByRoleDao = async (conn, role) => {
  const sql = `select u.id,
  CONCAT(u.first_name, ' ', u.last_name) as employee,
  u.contact_no,
  u.company,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.role = '${role}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getEmployeeStartDayDao = async (conn, todayDate) => {
  const sql = ` SELECT user 
  FROM user_activities 
  WHERE event_type = '${START_DAY}'
  AND created_at = '${todayDate}' `;

  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};
const getAppCloseEmployeeListDao = async (conn, data) => {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() - 22);
  const ids = data.map((item) => `'${item.user}'`).join(',');
  const sql = `SELECT DISTINCT user 
    FROM user_activities 
    WHERE user NOT IN (
      SELECT user FROM user_activities 
      WHERE event_type = '15min'
      AND created_at >= DATE_SUB('${currentTime.toISOString()}', INTERVAL 22 MINUTE)
    )
    AND user IN (${ids})`;
  const result = await conn.query(sql);
  if (result && result[0]) {
    return result;
  }
  return undefined;
};

const getFcmTokenDao = async (conn, data) => {
  const ids = data.map((item) => `'${item.user}'`).join(',');
  const sql = `SELECT JSON_EXTRACT(config, '$.fcmToken') as fcmToken 
  FROM login WHERE username IN (${ids})`;

  const fcmToken = await conn.query(sql);
  if (fcmToken && fcmToken.length === 0) {
    return fcmToken;
  }

  return undefined;
};

export {
  getUsersByRoleDao,
  startDayDao,
  endDayDao,
  getAttendanceDao,
  checkDayDao,
  checkLeaveDao,
  addLeaveDao,
  cronEndDayDao,
  cronAbsentDao,
  getEmployeeRolesIdDao,
  getAllAttendanceDao,
  getAllAttendanceByFilterDao,
  getTrackingDao,
  checkEventType,
  getEmployeeStartDayDao,
  getAppCloseEmployeeListDao,
  getFcmTokenDao,
};
