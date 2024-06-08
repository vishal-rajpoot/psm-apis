import { generateUUID } from '../utils/helper';

const getUnitDao = async (conn, token) => {
  const sql = `select u.id, u.unit, u.position
  from units1 as u
  where u.company = '${token.companyId}'
  and u.is_obsolate = false
  order by u.position`;
  const unit = await conn.query(sql);
  if (unit && unit[0]) {
    return { unit };
  }
  return undefined;
};

const getUnitLimitDao = async (conn, token, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND u.unit LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from units1 as u
  where u.company = '${token.companyId}'
  AND u.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select u.id, u.unit, u.position
  from units1 as u
  where u.company = '${token.companyId}'
  and u.is_obsolate = false
  ${searchCondition}
  order by u.position
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const unit = await conn.query(sql);
  if (unit && unit[0]) {
    return { totalRowsValue, unit };
  }
  return undefined;
};

const getUnitByIdDao = async (conn, token, id) => {
  const sql = `select u.id, u.unit, u.position
  from units1 as u
  where u.company = '${token.companyId}'
  and u.id = '${id}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateUnitHierarchyDao = async (conn, id, position, token) => {
  const sql = `update units1 set position = '${position}'
  where id = '${id}'
  and units1.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const Region = { ...data[0] };
    return Region;
  }
  return undefined;
};

const updateUnitDao = async (conn, id, payload, token) => {
  const sql = `update units1 set unit = '${payload.unit}'
  where id = '${id}'
  and units1.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const unit = { ...data[0] };
    return unit;
  }
  return undefined;
};

const updateUnitPositionDao = async (conn, id, position, token) => {
  const sql = `update units1 set position = '${position}'
  where id = '${id}'
  and units1.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const addUnitDao = async (conn, payload, position, token) => {
  const id = generateUUID();
  const sql = `insert into units1 (id, unit, position, company)
  values ( '${id}', '${payload.unit}', '${position}', '${token.companyId}' ) RETURNING units1.id`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const deleteUnitDao = async (conn, id, token) => {
  const sql = `update units1 set is_obsolate = true
  where id = '${id}'
  and units1.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

export {
  getUnitDao,
  getUnitLimitDao,
  getUnitByIdDao,
  updateUnitDao,
  updateUnitPositionDao,
  addUnitDao,
  deleteUnitDao,
  updateUnitHierarchyDao,
};
