import { generateUUID } from '../utils/helper';

const getAllUnassignedUsersDao = async (conn, token, id) => {
  const sql = `select u.id,
    CONCAT(u.first_name, " ", u.last_name) as full_name,
    d.designation,
    d.id as designation_id
    from users u
    join designations d on d.id = u.designation
    where u.company = '${token.companyId}'
    and u.designation = '${id}'
    and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getAllEmployeesAssignedByManagerIdDao = async (conn, id, token) => {
  const sql = `
    SELECT
      u.id AS id,
      d.designation,
      CONCAT(u.first_name, ' ', u.last_name) AS employee,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name
    FROM
      user_hierarchy uh
    INNER JOIN
      users u ON JSON_CONTAINS(JSON_UNQUOTE(JSON_EXTRACT(uh.config, '$.child[*].employees')), CONCAT('"', u.id, '"'))
    JOIN
      designations d ON d.id = u.designation
    WHERE
      uh.company = '${token.companyId}'
      AND uh.user = '${id}'
      AND uh.is_obsolate = false`;

  const data = await conn.query(sql);
  return data;
};

const getVendorsWithDesignationAssignedByManagerIdDao = async (
  conn,
  id,
  token
) => {
  const sql = `SELECT 
  JSON_EXTRACT(config, '$.vendor') AS vendors
  FROM user_hierarchy as uh
    where uh.user = '${id}'
    and uh.company = '${token.companyId}'
    and uh.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getVendorsInChildDao = async (conn, id, token) => {
  const sql = `SELECT 
  JSON_EXTRACT(config, '$.child') AS vendors
  FROM user_hierarchy as uh
    where uh.user = '${id}'
    and uh.company = '${token.companyId}'
    and uh.is_obsolate = false `;
  const data = await conn.query(sql);
  console.log(id);
  if (data) {
    return data;
  }
  return undefined;
};

const getAllVendorsDao = async (conn, companyId) => {
  const sql = `SELECT u.id as vendor_id,
    uh.id as user_hierarchy_id,
    JSON_EXTRACT(uh.config, '$.vendor') AS vendors
    FROM user_hierarchy uh
    INNER JOIN users u ON JSON_CONTAINS(uh.config, CONCAT('["', u.id, '"]'), '$.vendor')
    and uh.company = '${companyId}'
    and uh.is_obsolate = false `;
  const data = await conn.query(sql);

  return data;
};

const updateHierarchyDao = async (conn, companyId, id, payload) => {
  const basic = `"${payload.join('","')}"`;
  const sql = `UPDATE user_hierarchy
  SET config = JSON_SET(config, '$.vendor', JSON_ARRAY(${basic}))
  where company = '${companyId}'
  and id = '${id}'
  `;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const addUserAssignmentsDao = async (conn, payload, token) => {
  const config = JSON.stringify(payload.config);
  const id = generateUUID();
  const sql = `insert into user_hierarchy(id,user,config,company,created_by,updated_by)
    values ('${id}','${payload.employeeId}', '${config}', '${token.companyId}', '${token.userId}', '${token.userId}')
    RETURNING user_hierarchy.id`;
  const data = await conn.query(sql);
  return data[0];
};

const updateUserAssignmentDao = async (conn, id, payload, token) => {
  const { parent } = payload;
  const parentValues = `"${parent.join('","')}"`;
  const { child } = payload;
  const childValues = `"${child.join('","')}"`;
  const sql = `update user_hierarchy
    set config = json_set(config, '$.parent', JSON_ARRAY(${parentValues}) , '$.child', JSON_ARRAY(${childValues}) ) , updated_by = '${token.userId}'
    where user_hierarchy.company = '${token.companyId}'
    and user_hierarchy.user = '${id}'`;
  const data = await conn.query(sql);

  return data.affectedRows;
};

const updateEmployeeVendorAssignmentDao = async (conn, id, payload, token) => {
  const vendor = payload.config;
  const newConfig = JSON.stringify(vendor);
  const sql = `UPDATE user_hierarchy
  SET config = '${newConfig}',
  updated_by = '${token.userId}'
  WHERE user_hierarchy.company = '${token.companyId}'
  AND user_hierarchy.user = '${id}' `;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const employeeByVendorIdDao = async (conn, payload) => {
  const sql = `select user from user_hierarchy
    WHERE JSON_CONTAINS(JSON_EXTRACT(user_hierarchy.config, '$.vendor'),
    '"${payload.id}"')
    AND company = '${payload.token.companyId}'
`;
  const data = await conn.query(sql);
  return data;
};

const deleteUserManagementDao = async (conn, companyId, userId) => {
  const sql = `update user_hierarchy set is_obsolate = true where user = '${userId}' and company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const User = { ...data[0] };
    return User;
  }
  return undefined;
};

const vendorByEmployeeIdDao = async (conn, payload) => {
  const sql = `select JSON_EXTRACT(user_hierarchy.config, '$.vendor') as vendors
  from user_hierarchy
    WHERE user = '${payload.token.userId}'
    AND company = '${payload.token.companyId}'
    AND is_obsolate = false`;
  const data = await conn.query(sql);

  return data[0];
};

const getHierarchyDetailByUserIdDao = async (conn, id, token) => {
  const sql = `select * from user_hierarchy
  where user = '${id}'
  AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data;
};

const getAllUsersHierarchyByCompany = async (conn, token) => {
  const sql = `select user as user_id
  from user_hierarchy
  where company = '${token.companyId}'
  AND is_obsolate = false`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const vendorsDetailByUserIdDao = async (conn, id, token) => {
  const sql = `select
  JSON_EXTRACT(config, '$.vendor') as vendors_id
  from user_hierarchy
  where user = '${id}'
  AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data[0];
};

export {
  getVendorsInChildDao,
  getAllUnassignedUsersDao,
  getAllEmployeesAssignedByManagerIdDao,
  getVendorsWithDesignationAssignedByManagerIdDao,
  addUserAssignmentsDao,
  updateUserAssignmentDao,
  updateEmployeeVendorAssignmentDao,
  employeeByVendorIdDao,
  vendorByEmployeeIdDao,
  getHierarchyDetailByUserIdDao,
  vendorsDetailByUserIdDao,
  deleteUserManagementDao,
  getAllVendorsDao,
  updateHierarchyDao,
  getAllUsersHierarchyByCompany,
};
