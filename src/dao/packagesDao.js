import { generateUUID } from '../utils/helper';

const getAllPackagesDao = async (conn, company) => {
  const sql = `select p.id,
    p.package_name,
    p.config,
    u.first_name as updated_by_first_name,
    u.last_name as updated_by_last_name
    FROM packages as p
    JOIN users u ON u.id=p.updated_by
    WHERE p.company = '${company}'
    AND p.is_obsolate = false
    order by p.created_at DESC
  `;
  const packageData = await conn.query(sql);
  if (packageData && packageData[0]) {
    return { packageData };
  }
  return undefined;
};

const getAllPackagesLimitDao = async (conn, company, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND p.package_name LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from packages as p
  where p.company = '${company}'
  AND p.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select p.id,
    p.package_name,
    p.config,
    u.first_name as updated_by_first_name,
    u.last_name as updated_by_last_name
    FROM packages as p
    JOIN users u ON u.id=p.updated_by
    WHERE p.company = '${company}'
    AND p.is_obsolate = false
    ${searchCondition}
    order by p.${payload.column} ${payload.sort}
    LIMIT ${payload.limit} OFFSET ${offset}`;
  const packageData = await conn.query(sql);
  if (packageData && packageData[0]) {
    return { totalRowsValue, packageData };
  }
  return undefined;
};

const getPackageByIdDao = async (id, company, conn) => {
  const sql = `select p.id,
    p.package_name,
    p.config,
    u.first_name as updated_by_first_name,
    u.last_name as updated_by_last_name
    FROM packages as p
    JOIN users u ON u.id=p.updated_by
    WHERE p.company = '${company}'
    AND p.id = '${id}'
    AND p.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data;
  }
  return undefined;
};

const getPackageByNamedao = async (conn, company, payload) => {
  const sql = `select *
  FROM packages as p
  WHERE p.company = '${company}'
  AND p.package_name = '${payload.package_name}'
  AND p.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data[0];
  }
  return undefined;
};

const addPackageDao = async (conn, company, userId, payload) => {
  const config = JSON.stringify(payload.config);
  const id = generateUUID();
  const sql = `INSERT INTO packages (id,package_name, config, company,created_by,updated_by)
  VALUES ('${id}', '${payload.package_name}','${config}','${company}','${userId}','${userId}')
  RETURNING packages.id`;
  const data = await conn.query(sql);
  return data[0];
};

const updatePackageDao = async (conn, id, company, userId, payload) => {
  const config = JSON.stringify(payload.config);
  const sql = `UPDATE packages
  SET package_name = '${payload.package_name}', config = '${config}',
  updated_by = '${userId}'
  where packages.id = '${id}'
  AND packages.company = '${company}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const updatePackageStatusDao = async (conn, id, company, userId, payload) => {
  const { status } = payload;
  const sql = `UPDATE packages
  SET config = json_set(config, '$.status' , '${status}' ),
  updated_by = '${userId}'
  where packages.id = '${id}'
  AND packages.company = '${company}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deletePackageDao = async (conn, id, company, userId) => {
  const sql = `UPDATE packages
    SET is_obsolate = true,
    updated_by = '${userId}'
    where packages.id = '${id}'
    AND packages.company = '${company}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

export {
  getAllPackagesDao,
  getAllPackagesLimitDao,
  getPackageByIdDao,
  getPackageByNamedao,
  addPackageDao,
  updatePackageDao,
  updatePackageStatusDao,
  deletePackageDao,
};
