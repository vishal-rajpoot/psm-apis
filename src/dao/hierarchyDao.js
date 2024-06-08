import { generateUUID } from '../utils/helper';

const getAllDesignationsHierarchyDao = async (conn, companyId) => {
  const sql = `select d.id,
    d.config
    from designation_hierarchy as d
    where d.company = '${companyId}'
    and d.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data.length > 0) {
    return data;
  }
  return undefined;
};

const getAllDesignationsHierarchyByDeptDao = async (conn, companyId, dept) => {
  const sql = `SELECT
  d.id,
  JSON_EXTRACT(config, '$.${dept}') AS result
FROM
  designation_hierarchy as d
    where d.company = '${companyId}'
    and d.is_obsolate = false
    ORDER BY
  JSON_EXTRACT(config, '$.vendor[*]') + 0`;
  const data = await conn.query(sql);
  return data;
};

const addDesignationHierarchyDao = async (conn, payload, companyId, userId) => {
  const config = JSON.stringify(payload, (key, value) => {
    if (typeof value === 'object') {
      return value;
    }
    return value;
  });

  const id = generateUUID();
  const sql = `insert into designation_hierarchy(id,config,company,created_by,updated_by)
    values ('${id}', '${config}', '${companyId}', '${userId}', '${userId}')
    RETURNING designation_hierarchy.id`;
  const data = await conn.query(sql);
  return data[0];
};

const updateDesignationHierarchyDao = async (
  conn,
  config,
  companyId,
  userId,
  id
) => {
  const modifiedConfig = JSON.stringify(config, (key, value) => {
    if (typeof value === 'object') {
      return value;
    }
    return value;
  });
  const sql = `update designation_hierarchy
    set config = '${modifiedConfig}', updated_by = '${userId}'
    where designation_hierarchy.id = '${id}'
    and designation_hierarchy.company = '${companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deleteDesignationHierarchyDao = async (conn, id, token) => {
  const sql = `update designation_hierarchy
    SET is_obsolate = true
    where designation_hierarchy.id = '${id}'
    and designation_hierarchy.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const getChildDesignationDao = async (conn, dept, token) => {
  const sql = `SELECT JSON_KEYS(JSON_EXTRACT(config, '$.${dept}')) AS ids
    FROM designation_hierarchy
    where company = '${token.companyId}' 
    and is_obsolate = false`;
  const data = await conn.query(sql);
  return data;
};

const getDesignationRelationsDao = async (
  conn,
  source,
  destination,
  companyId
) => {
  const sql = `SELECT id, relations.*  FROM designation_hierarchy,
  JSON_TABLE(
    config,
    '$.relations[*]' COLUMNS (
      source VARCHAR(255) PATH '$.source',
      destination VARCHAR(255) PATH '$.destination',
      config JSON PATH '$.config'
    )
  ) AS relations
  WHERE
  relations.source = '${source}'
  and relations.destination = '${destination}'
  and company = '${companyId}'
  and is_obsolate = false`;
  const data = await conn.query(sql);

  if (data && data[0]) {
    const configData = data[0].config;
    const newConfig = JSON.parse(configData);
    data[0].config = newConfig;
    return data[0];
  }
  return undefined;
};

const getDesignationNameDao = async (conn, id, token) => {
  const sql = `select d.id,
    d.designation
    from designations as d
    where d.company = '${token.companyId}'
    and d.id = '${id}'
    and d.is_obsolate = false`;
  const data = await conn.query(sql);

  return data;
};

const getVendorDesignationAssociatedWithEmployeeDesignation = async (
  conn,
  id,
  token
) => {
  const sql = `SELECT
  JSON_EXTRACT(config, CONCAT('$.relations[*].config."', '${id}', '"')) AS id
FROM
  designation_hierarchy
WHERE
  company = '${token.companyId}'
  and is_obsolate = false`;
  const data = await conn.query(sql);
  if (!data[0]?.id) {
    return undefined;
  }
  const vendorId = data[0]?.id[0];

  const vendorIdsStr = vendorId?.join("','");
  const sql2 = `SELECT id, designation
FROM
  designations
WHERE
  company = '${token.companyId}'
  and id IN ('${vendorIdsStr}')
  and is_obsolate = false`;
  const data2 = await conn.query(sql2);
  if (data2 && data2[0]) {
    return data2;
  }
  return undefined;
};

const getVendorsUnderEmpDao = async (conn, id, companyId) => {
  const sql = `SELECT 
    JSON_EXTRACT(JSON_UNQUOTE(config), '$.relations[*].config.${id}') AS vendor_designations
    FROM 
    designation_hierarchy as dh
    WHERE dh.company = '${companyId}'
    and dh.is_obsolate = false`;
  const data = await conn.query(sql);
  if (!data[0]?.vendor_designations) {
    return undefined;
  }
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

export {
  getAllDesignationsHierarchyDao,
  getAllDesignationsHierarchyByDeptDao,
  addDesignationHierarchyDao,
  updateDesignationHierarchyDao,
  deleteDesignationHierarchyDao,
  getChildDesignationDao,
  getDesignationNameDao,
  getVendorDesignationAssociatedWithEmployeeDesignation,
  getDesignationRelationsDao,
  getVendorsUnderEmpDao,
};
