import { generateUUID } from '../utils/helper';
import { ACTIVE } from '../utils/constants';

const getUserbyContactNoDao = async (conn, contactNo) => {
  const sql = `select u.*, 
  r.role as role_name,
  d.designation as designation_name
 from users u 
 inner join roles r on u.role = r.id
 inner join designations d on u.designation = d.id 
  where contact_no = '${contactNo}'
  AND u.is_obsolate = false
  `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};
const getStateFromUserId = async (conn, userId) => {
  const sql = 'SELECT config FROM users WHERE id = ?';
  const data = await conn.query(sql, [userId]);
  if (data && data[0]) {
    if (data && data[0].config && data[0].config.state) {
      return data[0].config.state;
    }
  }
  return undefined;
};
const addDeleteStatus = async (conn, newUserPayload) => {
  const userId = newUserPayload.deleteUserid;
  const sql =
    "UPDATE users SET config = JSON_SET(config, '$.assign', 1) WHERE id = ?";
  const data = await conn.query(sql, [userId]);
  if (data && data) {
    return data;
  }
  return undefined;
};

const statusChangetByIdDao = async (conn, companyId, id, status, payload) => {
  let sql;
  if (status === 'rejected') {
    sql = `UPDATE users SET config = JSON_SET(config, '$.authority', '${status}', '$.deleteresonfor', '${payload.deleteResonFor}') WHERE id = '${id}'`;
  } else {
    sql = `UPDATE users SET config = JSON_SET(config, '$.authority', '${status}') WHERE id = '${id}'`;
  }
  const result = await conn.query(sql);
  if (result && result[0]) {
    return result;
  }
  return undefined;
};

const assigneRoleDao = async (conn, payload) => {
  const sql = `
    UPDATE users 
    SET designation = '${payload.designation_id}', config = JSON_SET(config, '$.authority', 'confirm')
    WHERE id = '${payload.id}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }

  return undefined;
};

const assignDeleteUserDao = async (conn, token, payload) => {
  const checkSql = `
    SELECT * FROM user_hierarchy
    WHERE user = '${payload.id}'
    AND company = '${token.companyId}'`;
  const checkResult = await conn.query(checkSql);
  if (checkResult && checkResult.length > 0) {
    const getconfigfordeleteuser = `
      SELECT config FROM user_hierarchy
      WHERE user = '${payload.deleteUserid}'
      AND company = '${token.companyId}'`;
    const configResult = await conn.query(getconfigfordeleteuser);
    const configValue =
      configResult && configResult.length > 0 ? configResult[0].config : null;
    const updateSql = `
      UPDATE user_hierarchy
      SET config = '${JSON.stringify(configValue)}'
      WHERE user = '${payload.id}'
      AND company = '${token.companyId}'`;
    const value = await conn.query(updateSql);
    if (value && value[0]) {
      return value;
    }
    return undefined;
  }
  const sql = `
      UPDATE user_hierarchy
      SET user = '${payload.id}',
      is_obsolate = false
      WHERE user = '${payload.deleteUserid}'
      AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const registeredUserDao = async (conn, companyId, status) => {
  const sql = `SELECT * FROM users WHERE company ='${companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const usersWithAuthority = data.filter(
      (user) => user.config && user.config.authority === status
    );
    return { usersWithAuthority };
  }
  return undefined;
};
const getRmWiseregisteredUserDao = async (conn, companyId, status, state) => {
  const sql =
    "SELECT * FROM users WHERE company = ? AND JSON_EXTRACT(config, '$.state') = ?";
  const data = await conn.query(sql, [companyId, state]);
  if (data && data.length > 0) {
    const usersWithAuthority = data.filter(
      (user) => user.config && user.config.authority === status
    );
    return { usersWithAuthority };
  }
  return undefined;
};

const getUsersLimitDao = async (
  conn,
  companyId,
  role,
  payload,
  offset,
  designationId
) => {
  let searchCondition = '';
  let designation = '';
  if (designationId) {
    designation = `AND u.designation = '${designationId}'`;
  }
  if (payload.searchText) {
    searchCondition = `AND (u.first_name LIKE '%${payload.searchText}%' OR u.last_name LIKE '%${payload.searchText}%')`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from users as u
  where u.company = '${companyId}'
  AND u.role = '${role}' 
  AND u.is_obsolate = false
  ${designation}
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select u.id,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  u.config,
  u.email,
  d.designation,
  u.contact_no,
  u.status,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.status = '${payload.status}'
  and u.role = '${role}'
  ${designation}
  and u.is_obsolate = false
  ${searchCondition}
  order by u.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const user = await conn.query(sql);
  if (user && user[0]) {
    return { totalRowsValue, user };
  }
  return undefined;
};

const getActiveOrInactiveUsersDao = async (
  conn,
  companyId,
  role,
  payload,
  designationId,
  status,
  lowerLevelId
) => {
  const params = [];
  let designation = '';
  if (designationId) {
    designation = `AND u.designation = '${designationId}'`;
  }
  let sql = `select u.id,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  u.config,
  u.email,
  d.designation,
  u.contact_no,
  u.status,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.status = '${payload.status}'
  and u.role = '${role}'
  ${designation}
  and u.is_obsolate = false
`;
  if (status === false) {
    if (lowerLevelId && lowerLevelId.length > 0) {
      const placeholders = Array(lowerLevelId.length).fill('?').join(',');
      sql += ` AND u.id IN (${placeholders})`;
      params.push(...lowerLevelId);
    } else {
      return undefined;
    }
  }
  const user = await conn.query(sql, params);
  if (user && user[0]) {
    return { user };
  }
  return undefined;
};

const getDeletedUsersDao = async (
  conn,
  companyId,
  role,
  payload,
  designationId,
  status,
  lowerLevelId
) => {
  let designation = '';
  if (designationId) {
    designation = `AND u.designation = '${designationId}'`;
  }
  let sql = `select u.id,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  u.config,
  u.email,
  d.designation,
  u.contact_no,
  u.status,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.role = '${role}'
  ${designation}
  and u.is_obsolate = ${payload.deleted}
`;

  if (status === false) {
    if (lowerLevelId && lowerLevelId.length > 0) {
      sql += ` AND u.id IN (${lowerLevelId})`;
    } else {
      return undefined;
    }
  }
  const user = await conn.query(sql);
  if (user && user[0]) {
    return { user };
  }
  return undefined;
};
const fetchEmployeeHierarchy = async (conn, user, companyId) => {
  const employeeIds = [];
  const sql = `
    SELECT
      u.id AS id,
      d.designation
    FROM
      user_hierarchy uh
    INNER JOIN
      users u ON JSON_CONTAINS(JSON_UNQUOTE(JSON_EXTRACT(uh.config, '$.child[*].employees')), CONCAT('"', u.id, '"'))
    JOIN
      designations d ON d.id = u.designation
    WHERE
      uh.company = '${companyId}'
      AND uh.user = '${user}'
      AND uh.is_obsolate = false`;
  const rows = await conn.query(sql);
  if (rows.length > 0) {
    for (const row of rows) {
      employeeIds.push(row.id);
      const childHierarchy = await fetchEmployeeHierarchy(
        conn,
        row.id,
        companyId
      );
      employeeIds.push(...childHierarchy);
    }
  }
  return employeeIds;
};

const getEmloyeeDao = async (conn, companyId, roleId) => {
  const params = [companyId, roleId];
  let sql = `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.config,
      u.email,
      d.designation,
      u.contact_no,
      u.status,
      r.role
    FROM 
      users AS u
    JOIN 
      roles AS r ON u.role = r.id
    JOIN 
      designations AS d ON u.designation = d.id
    WHERE 
      u.company = ?
      AND u.role = ?
      AND u.is_obsolate = false
      AND u.status = 'Active'
      AND (
        JSON_EXTRACT(u.config, '$.authority') IS NULL OR
        JSON_EXTRACT(u.config, '$.authority') = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.authority')) != 'pending' AND JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.authority')) != 'rejected'
      )`;
  sql += ' ORDER BY u.created_at DESC';
  const user = await conn.query(sql, params);
  if (user && user[0]) {
    return user ;
  }

  return undefined;
};
const getUsersDao = async (
  conn,
  companyId,
  role,
  designationId,
  status,
  lowerLevelId
) => {
  let designation = '';
  const params = [companyId, role];

  if (designationId) {
    designation = 'AND u.designation = ?';
    params.push(designationId);
  }

  let sql = `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.config,
      u.email,
      d.designation,
      u.contact_no,
      u.status,
      r.role
    FROM 
      users AS u
    JOIN 
      roles AS r ON u.role = r.id
    JOIN 
      designations AS d ON u.designation = d.id
    WHERE 
      u.company = ?
      AND u.role = ?
      ${designation}
      AND u.is_obsolate = false
      AND (
        JSON_EXTRACT(u.config, '$.authority') IS NULL OR
        JSON_EXTRACT(u.config, '$.authority') = '' OR
        JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.authority')) != 'pending' AND JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.authority')) != 'rejected'
      )`;

  if (status === false) {
    if (lowerLevelId && lowerLevelId.length > 0) {
      const placeholders = Array(lowerLevelId.length).fill('?').join(',');
      sql += ` AND u.id IN (${placeholders})`;
      params.push(...lowerLevelId);
    } else {
      return undefined;
    }
  }

  sql += ' ORDER BY u.created_at DESC';

  const user = await conn.query(sql, params);

  if (user && user[0]) {
    return { user };
  }

  return undefined;
};

const getUsersDesignationAndRoleDao = async (
  conn,
  companyId,
  role,
  designationId
) => {
  const sql = `select u.id,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  u.config,
  u.email,
  d.designation,
  u.contact_no,
  u.status,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.role = '${role}'  
  and u.designation = '${designationId}'
  and u.is_obsolate = false
  order by u.created_at desc
`;
  const user = await conn.query(sql);
  if (user && user[0]) {
    return { user };
  }
  return undefined;
};

const getDesignationIdByUserIdDao = async (conn, companyId, id) => {
  const sql = `select d.id,
  d.designation,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.id = '${id}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};
const getDeletedUsersByDesignationDao = async (
  conn,
  companyId,
  designationId
) => {
  const sql = `select id,
  first_name,
  last_name,
  CONCAT(first_name, ' ', last_name) as full_name,
  config,
  email,
  designation,
  contact_no,
  status
  from users 
  where company = '${companyId}'
  AND (JSON_EXTRACT(config, '$.assign') IS NULL OR JSON_EXTRACT(config, '$.assign') != 1)
  and designation = '${designationId}' 

  and is_obsolate = true
  order by created_at desc
   `;

  const data = await conn.query(sql);
  if (data && data[0]) {
    return { data };
  }
  return undefined;
};

const getUsersRegionWiseDao = async (
  conn,
  companyId,
  role,
  region,
  designationId
) => {
  let designation = '';
  if (designationId) {
    designation = `AND u.designation = '${designationId}'`;
  }
  const sql = `select u.id,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  u.config,
  u.email,
  d.designation,
  u.contact_no,
  u.status,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.role = '${role}'
  and u.is_obsolate = false
  ${designation}
  and JSON_UNQUOTE(JSON_EXTRACT(u.config, '$.regionID')) = '${region}'`;
  const user = await conn.query(sql);
  if (user && user[0]) {
    return { user };
  }
  return undefined;
};

const getUserByIdDao = async (conn, companyId, id) => {
  const sql = `select u.id,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  u.config,
  d.designation,
  u.contact_no,
  u.status,
  r.role,
  u.email
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.id = '${id}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getUsersByDesignationDao = async (conn, companyId, designationId) => {
  const sql = `select u.id,
  u.first_name,
  u.last_name,
  u.config,
  d.designation,
  d.id as designation_id,
  u.contact_no,
  u.status,
  r.role
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  where u.company = '${companyId}'
  and u.designation = '${designationId}'
  and u.is_obsolate = false 
`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getUsersByContactNoDao = async (conn, token, payload) => {
  const sql = `select u.id,
  CONCAT(u.first_name, ' ', u.last_name) as name
  from users as u
  where u.company = '${token.companyId}'
  and u.contact_no = '${payload.contact_no}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateUserDao = async (conn, id, payload, token) => {
  const config = JSON.stringify(payload.config);
  const sql = `update users set first_name = '${payload.first_name}', last_name = '${payload.last_name}', email = '${payload.email}', contact_no = '${payload.contact_no}', status = '${payload.status}', config = '${config}' where users.id = '${id}' and users.company = '${token.companyId}' `;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

const addUserDao = async (conn, token, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `insert into users ( id, first_name, last_name, email, contact_no, role, designation, company, status, config, created_by, updated_by )
  values ( '${id}', '${payload.first_name}','${payload.last_name}', '${payload.email}', '${payload.contact_no}', '${payload.role_id}','${payload.designation_id}', '${token.companyId}', '${ACTIVE}', '${config}', '${token.userId}', '${token.userId}' )
  RETURNING users.id`;
  const data = await conn.query(sql);
  return data[0];
};
const addEmployeeService = async (conn, token, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `insert into users ( id, first_name, last_name,contact_no, role, designation, company, status, config, created_by, updated_by )
  values ( '${id}', '${payload.first_name}','${payload.last_name}','${payload.contact_no}', '${payload.role_id}','${payload.designation_id}', '${token.companyId}', '${ACTIVE}', '${config}', '${token.userId}', '${token.userId}' )
  RETURNING users.id`;
  const data = await conn.query(sql);
  return data[0];
};

const addSignupUserDao = async (conn, payload) => {
  const id = generateUUID();
  payload.config.authority = 'pending';
  payload.config.flag = 0;
  const configString = JSON.stringify(payload.config);
  const role_id = '2ceddc14-24b8-4730-ac4b-77cb3b8e2d80';
  const designation_id = '48c84f25-f049-48bf-8513-478b4dc37219';
  const sql = `insert into users ( id, first_name, last_name, email, contact_no, role, designation, company, status, config )
  values ( '${id}', '${payload.first_name}','${payload.last_name}', '${payload.email}', '${payload.contact_no}', '${role_id}','${designation_id}', '${payload.companyId}', '${ACTIVE}', '${configString}' )
  RETURNING users.id`;
  const data = await conn.query(sql);
  return data[0];
};
const addSignupMdaDao = async (conn, payload) => {
  const id = generateUUID();
  payload.config.authority = 'confirm';
  payload.config.flag = 0;
  const configString = JSON.stringify(payload.config);
  const role_id = '2ceddc14-24b8-4730-ac4b-77cb3b8e2d80';
  const designation_id = '51ddb317-6b62-42f7-9ea4-f2c878e5344a';
  const sql = `insert into users ( id, first_name, last_name, email, contact_no, role, designation, company, status, config )
  values ( '${id}', '${payload.first_name}','${payload.last_name}', '${payload.email}', '${payload.contact_no}', '${role_id}','${designation_id}', '${payload.companyId}', '${ACTIVE}', '${configString}' )
  RETURNING users.id`;
  const data = await conn.query(sql);
  if (data && data[0]) {
  return data[0];
  }
  undefined;
};


const deleteUserDao = async (conn, companyId, id) => {
  const sql = `update users set is_obsolate = true where id = '${id}' and company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const User = { ...data[0] };
    return User;
  }
  return undefined;
};

const checkMobilenumberForSignup = async (conn, payload) => {
  const sql = `select u.id,
  CONCAT(u.first_name, ' ', u.last_name) as name
  from users as u
  where u.company = '${payload.companyId}'
  and u.contact_no = '${payload.contact_no}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateUserDesignationDao = async (conn, token, id, payload) => {
  const sql = `update users set designation = '${payload.designationId}', updated_by = '${token.userId}' where users.id = '${id}' and users.company = '${token.companyId}' `;
  const data = await conn.query(sql);
  return data[0];
};

const getUserIdByNameDao = async (conn, token) => {
  const sql = `select u.id, CONCAT(u.first_name, ' ', u.last_name) as name
    from users u
    where u.company = '${token.companyId}'
    and u.is_obsolate = false`;
  const data = await conn.query(sql);

  return data;
};

const getAllEmployeeTodayAttendanceDao = async (conn, payload) => {
  const sql = `
SELECT
  IF(COUNT(*) > 0, 1, 0) as result
FROM
  user_activities as a
  JOIN users as u ON a.user = u.id
WHERE
  a.company = '${payload.companyId}'
  AND a.user = '${payload.id}'
  AND a.event_type = '${payload.event_type}'
  AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) >= '${payload.date} 00:00:00'
  AND JSON_UNQUOTE(JSON_EXTRACT(a.config, '$.start_time')) <= '${payload.date} 23:59:59'
  AND a.is_obsolate = false;
`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0].result;
  }
  return undefined;
};

const updatePasswordDao = async (conn, id, company, hashedPassword) => {
  const sql = `update users set password = '${hashedPassword}'
  where users.id = '${id}' and users.company = '${company}' `;

  const data = await conn.query(sql);
  if (data && data[0]) {
    const User = { ...data[0] };
    return User;
  }
  return undefined;
};
const fetchDesignationRole = async (conn, companyId, id) => {
  const sql = `select designation
  from designations 
  where company = '${companyId}'
  and id = '${id}'
  and is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};
const getUserPasswordByIdDao = async (conn, companyId, id) => {
  const sql = `select u.password
  from users as u
  where u.company = '${companyId}'
  and u.id = '${id}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};
const fetchVendorHierarchy = async (conn, user, companyId) => {
  const employeeIds = [];
  const sql = `
    SELECT
      u.id AS id,
      d.designation
    FROM
      user_hierarchy uh
    INNER JOIN
      users u ON JSON_CONTAINS(JSON_UNQUOTE(JSON_EXTRACT(uh.config, '$.vendor[*].vendors')), CONCAT('"', u.id, '"'))
    JOIN
      designations d ON d.id = u.designation
    WHERE
      uh.company = '${companyId}'
      AND uh.user = '${user}'
      AND uh.is_obsolate = false`;
  const rows = await conn.query(sql);

  if (rows.length > 0) {
    for (const row of rows) {
      employeeIds.push(row.id);
      console.log(employeeIds);
      const childHierarchy = await fetchVendorHierarchy(
        conn,
        row.id,
        companyId
      );
      employeeIds.push(...childHierarchy);
    }
  }

  return employeeIds;
};
const fetchRole = async (conn, companyId, role) => {
  const sql = `select role
  from roles 
  where company = '${companyId}'
  and id = '${role}'
  and is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};
export {
  getUsersDao,
  getUsersDesignationAndRoleDao,
  getDeletedUsersDao,
  getActiveOrInactiveUsersDao,
  getUsersLimitDao,
  getUsersRegionWiseDao,
  getUserByIdDao,
  getUsersByDesignationDao,
  updateUserDao,
  addUserDao,
  addSignupUserDao,
  checkMobilenumberForSignup,
  deleteUserDao,
  getUsersByContactNoDao,
  getUserbyContactNoDao,
  updateUserDesignationDao,
  getUserIdByNameDao,
  getDesignationIdByUserIdDao,
  getAllEmployeeTodayAttendanceDao,
  getDeletedUsersByDesignationDao,
  updatePasswordDao,
  getUserPasswordByIdDao,
  assignDeleteUserDao,
  assigneRoleDao,
  registeredUserDao,
  statusChangetByIdDao,
  getStateFromUserId,
  getRmWiseregisteredUserDao,
  addDeleteStatus,
  fetchEmployeeHierarchy,
  fetchDesignationRole,
  fetchVendorHierarchy,
  fetchRole,
  addEmployeeService,
  getEmloyeeDao,
  addSignupMdaDao,
};
