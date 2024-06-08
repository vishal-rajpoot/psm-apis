import { generateUUID } from '../utils/helper';

const getAllRoutesLmitDao = async (conn, companyId, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND r.route LIKE '%${payload.searchText}%'`;
  }
  const sql = `select r.id,
    r.route_name,
    r.config
    from
    routes as r
    where r.company = '${companyId}'
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

const getAllRoutesDao = async (conn, companyId, payload) => {
  const sql = `select r.id,
    r.route_name,
    r.config
    from
    routes as r
    where r.company = '${companyId}'
    and r.is_obsolate = false
    order by r.${payload.column} ${payload.sort}
    `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getRouteByIdDao = async (conn, companyId, id) => {
  const sql = `select r.id,
  r.route_name,
  r.config
  from
  routes as r
  where r.company = '${companyId}'
  and r.id = '${id}'
  and r.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateAssignEmployeeDao = async (conn, companyId, payload, id) => {
  const config = JSON.stringify(payload);
  const sql = `update routes
    set config = '${config}'
    where routes.id = '${id}'
    and routes.company = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};

const updateRouteDao = async (conn, companyId, payload, id) => {
  const config = JSON.stringify(payload.config);
  const sql = `update routes
  set route_name = '${payload.route_name}', config = '${config}'
  where routes.id = '${id}'
  and routes.company = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};

const addRouteDao = async (conn, companyId, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `insert into routes
  (id, route_name, config, company)
  values ( '${id}', '${payload.route_name}', '${config}', '${companyId}' ) RETURNING routes.id`;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};

const deleteRouteDao = async (conn, companyId, id) => {
  const sql = `update routes
  set is_obsolate = true
  where routes.id = '${id}'
  and routes.company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data) {
    return data[0];
  }
  return undefined;
};

export {
  getAllRoutesLmitDao,
  getAllRoutesDao,
  getRouteByIdDao,
  addRouteDao,
  updateAssignEmployeeDao,
  updateRouteDao,
  deleteRouteDao,
};
