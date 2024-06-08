import { generateUUID } from '../utils/helper';

const getDesignationsLimitDao = async (conn, companyId, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND d.designation LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from designations as d
  where d.company = '${companyId}' 
  AND d.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select d.id,
  d.designation,
  d.role as role_id,
  r.role as role 
  from designations as d 
  join roles as r on d.role = r.id
  where d.company = '${companyId}' 
  and d.is_obsolate = false
  ${searchCondition}
  order by d.${payload.column} ${payload.sort} 
  LIMIT ${payload.limit} OFFSET ${offset}
  `;
  const designation = await conn.query(sql);
  if (designation && designation[0]) {
    return { totalRowsValue, designation };
  }
  return undefined;
};

const getDesignationsDao = async (conn, companyId) => {
  const sql = `select d.id,
  d.designation,
  d.role as role_id,
  r.role as role 
  from designations as d 
  join roles as r on d.role = r.id
  where d.company = '${companyId}' 
  and d.is_obsolate = false
  order by d.created_at desc`;
  const designation = await conn.query(sql);
  if (designation && designation[0]) {
    return { designation };
  }
  return undefined;
};

const getDesignationByIdDao = async (conn, companyId, designationId) => {
  const sql = `select d.id,d.designation from designations as d 
  where id = '${designationId}' and company = '${companyId}' and is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const designation = { ...data[0] };
    return designation;
  }
  return undefined;
};

const updateDesignationDao = async (
  conn,
  companyId,
  designationId,
  payload
) => {
  const sql = `update designations as d set designation = '${payload.designation}' where id = '${designationId}' and company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const designation = { ...data[0] };
    return designation;
  }
  return undefined;
};

const addDesignationDao = async (conn, companyId, payload) => {
  const id = generateUUID();
  const sql = `insert into designations (id, designation, role, company) values ( '${id}', '${payload.designation}', '${payload.role_id}', '${companyId}' ) returning designations.id`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const designation = { ...data[0] };
    return designation;
  }
  return undefined;
};

const deleteDesignationDao = async (conn, companyId, designationId) => {
  const sql = `update designations set is_obsolate = true 
  where id = '${designationId}' 
  and company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getDesignationsByRoleIdDao = async (conn, token, id) => {
  const sql = `select d.id, d.designation from designations as d 
    where d.role = '${id}' 
    and d.company = '${token.companyId}' 
    and d.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data;
  }
  return undefined;
};

const addDesignationPriorityDao = async (conn, token, id) => {
  const sql = `select d.id, d.designation from designations as d 
    where d.role = '${id}' 
    and d.company = '${token.companyId}' 
    and d.is_obsolate = false
`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data;
  }
  return undefined;
};

export {
  getDesignationsDao,
  getDesignationsLimitDao,
  getDesignationByIdDao,
  updateDesignationDao,
  addDesignationDao,
  deleteDesignationDao,
  getDesignationsByRoleIdDao,
  addDesignationPriorityDao,
};
