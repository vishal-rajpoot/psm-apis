import { generateUUID } from '../utils/helper';

const getRegionsDao = async (conn, token) => {
  const sql = `select r.id, r.region
  from regions as r
  where r.company = '${token.companyId}'
  and r.is_obsolate = false 
  order by r.created_at DESC
`;
  const region = await conn.query(sql);
  if (region && region[0]) {
    return { region };
  }
  return undefined;
};

const getRegionsLimitDao = async (conn, token, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND r.region LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from regions as r 
  where r.company = '${token.companyId}'
  AND r.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select r.id, r.region
  from regions as r
  where r.company = '${token.companyId}'
  and r.is_obsolate = false 
  ${searchCondition}
  order by r.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}
`;
  const region = await conn.query(sql);
  if (region && region[0]) {
    return { totalRowsValue, region };
  }
  return undefined;
};

const getRegionByIdDao = async (conn, token, id) => {
  const sql = `select r.id, r.region
  from regions as r
  where r.company = '${token.companyId}'
  and r.id = '${id}'
  and r.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateRegionDao = async (conn, id, payload, token) => {
  const sql = `update regions set region = '${payload.region}'
  where id = '${id}'
  and regions.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const Region = { ...data[0] };
    return Region;
  }
  return undefined;
};

const addRegionDao = async (conn, payload, token) => {
  const id = generateUUID();
  const sql = `insert into regions (id, region, company)
  values ( '${id}', '${payload.region}', '${token.companyId}' ) RETURNING regions.id`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const deleteRegionDao = async (conn, id, token) => {
  const sql = `update regions set is_obsolate = true
  where id = '${id}'
  and regions.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

export {
  getRegionsDao,
  getRegionsLimitDao,
  getRegionByIdDao,
  updateRegionDao,
  addRegionDao,
  deleteRegionDao,
};
