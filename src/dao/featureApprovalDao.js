import { generateUUID } from '../utils/helper';

const getApprovalDao = async (conn, companyId) => {
  const sql = `select
  a.designation as designation_id,
  d.designation,
  a.config
from
  feature_approval as a
  join designations as d on a.designation = d.id
where a.company = '${companyId}'
and a.is_obsolate = false
order by a.created_at DESC`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const addApprovalDao = async (conn, companyId, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `insert into feature_approval (id, designation, config, company) values ( '${id}', '${payload.designation_id}', '${config}', '${companyId}' )`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const order = { ...data[0] };
    return order;
  }
  return undefined;
};

const updateApprovalDao = async (conn, payload) => {
  const sql = `update user_activities
    set config = JSON_SET(config, '$[0].status' , '${payload.status}' )
    WHERE id = '${payload.id}'
    AND company = '${payload.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const order = { ...data[0] };
    return order;
  }
  return undefined;
};

const deleteApprovalDao = async (conn, companyId) => {
  const sql = `update feature_approval set is_obsolate = true where company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const order = { ...data[0] };
    return order;
  }
  return undefined;
};

const deleteApprovalDesignationDao = async (conn, companyId, designationId) => {
  const sql = `update feature_approval set is_obsolate = true 
  where company = '${companyId}' 
  and designation = '${designationId}' `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    const order = { ...data[0] };
    return order;
  }
  return undefined;
};

export {
  getApprovalDao,
  addApprovalDao,
  updateApprovalDao,
  deleteApprovalDao,
  deleteApprovalDesignationDao,
};
