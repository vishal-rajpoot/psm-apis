import { ROLE_TYPE } from '../utils/constants';
import { generateUUID } from '../utils/helper';

const getRolesDao = async (conn, token, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND r.role LIKE '%${payload.searchText}%'`;
  }
  const sql = `select r.id,
    r.role
    from
    roles as r
    where r.company = '${token.companyId}'
    AND r.role IN ('${ROLE_TYPE.EMPLOYEE}', '${ROLE_TYPE.VENDOR}')
    and r.is_obsolate = false
    ${searchCondition}
    order by r.${payload.column} ${payload.sort}
    LIMIT ${payload.limit} OFFSET ${offset}`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};
const getAllRolesDao = async (conn, token) => {
  const sql = `select r.id,
    r.role
    from
    roles as r
    where r.company = '${token.companyId}'
    and r.is_obsolate = false
    order by r.created_at DESC`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getRoleByIdDao = async (conn, companyId, id) => {
  const sql = `select r.id,
    r.role
    from
    roles as r
    where r.company = '${companyId}'
    and r.id = '${id}'
    and r.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateRoleDao = async (conn, token, payload, id) => {
  const sql = `update roles
  set role = '${payload.role}'
  where roles.id = '${id}'
  and roles.company = '${token.companyId}' `;
  const data = await conn.query(sql);
  return data[0];
};

const addRoleDao = async (conn, token, payload) => {
  const id = generateUUID();
  const sql = `insert into roles
  (id, role, company)
  values ( '${id}', '${payload.role}', '${token.companyId}' ) RETURNING roles.id`;
  const data = await conn.query(sql);
  return data[0];
};

const deleteRoleDao = async (conn, token, id) => {
  const sql = `update roles
  set is_obsolate = true
  where roles.id = '${id}'
  and roles.company = '${token.companyId}' `;
  const data = await conn.query(sql);
  return data[0];
};

const getRoleByNameDao = async (conn, token, role) => {
  const sql = `select *
  from roles
  where company = '${token.companyId}'
  and role = '${role}'
  and is_obsolate = false`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data[0];
  }
  return undefined;
};

export {
  getRolesDao,
  getAllRolesDao,
  getRoleByIdDao,
  addRoleDao,
  updateRoleDao,
  deleteRoleDao,
  getRoleByNameDao,
};
