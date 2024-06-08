import { generateUUID } from '../utils/helper';
import { NEW, REJECTED, APPROVED, STATUS } from '../utils/constants';

const getAllLeadsDao = async (conn, company, payload) => {
  const sql = `select l.id,
    l.first_name,  l.last_name,
    l.email,
    l.contact_no,
    d.designation as designation,
    l.status,
    l.config
    FROM leads as l
    JOIN designations d ON d.id=l.designation 
    AND l.company = '${company}'
    AND l.is_obsolate = false
    order by l.${payload.column} ${payload.sort}
`;
  const data = await conn.query(sql);

  return data;
};

const getAllLeadsLimitDao = async (conn, company, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND (l.first_name LIKE '%${payload.searchText}%' OR l.last_name LIKE '%${payload.searchText}%')`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from leads as l
  where l.company = '${company}' 
  AND l.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);
  const sql = `select l.id,
    l.first_name,  l.last_name,
    l.email,
    l.contact_no,
    d.designation as designation,
    l.status,
    l.config
    FROM leads as l
    JOIN designations d ON d.id=l.designation
    AND l.company = '${company}'
    AND l.is_obsolate = false
    ${searchCondition}
    order by l.${payload.column} ${payload.sort}
    LIMIT ${payload.limit} OFFSET ${offset}`;
  const data = await conn.query(sql);

  return { totalRowsValue, data };
};

const getLeadByIdDao = async (conn, req) => {
  const sql = `select l.id,
    l.first_name, l.last_name,
    l.email,
    l.contact_no,
    d.designation as designation,
    l.status,
    l.config
    FROM leads as l
    JOIN designations d ON d.id=l.designation
    WHERE l.company = '${req.user.companyId}'
    AND l.id = '${req.params.id}'
    AND l.is_obsolate = false`;
  const data = await conn.query(sql);

  return data;
};

const getLeadByContactNoDao = async (conn, companyId, contact_no) => {
  const sql = `select l.id,
    l.first_name,
    l.status
    FROM leads as l
    WHERE l.company = '${companyId}'
    AND l.contact_no = '${contact_no}'
    AND l.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const addLeadDao = async (conn, req) => {
  const config = JSON.stringify(req.body.config);
  const id = generateUUID();
  const sql = `INSERT INTO leads (id,first_name,last_name, contact_no,designation,company,status,config,created_by,updated_by)
  VALUES ('${id}', '${req.body.first_name}','${req.body.last_name}', '${req.body.contact_no}','${req.body.designation_id}','${req.user.companyId}','${NEW}','${config}','${req.user.userId}','${req.user.userId}')
  RETURNING leads.id`;
  const data = await conn.query(sql);
  return data[0];
};

const multipleAddLeadDao = async (conn, values, req) => {
  const id = generateUUID();
  const config = JSON.stringify(values.config);
  const sql = `INSERT INTO leads (id, first_name, last_name, contact_no, designation, company, status, config, created_by, updated_by)
  VALUES ('${id}', '${values.first_name}','${values.last_name}', '${values.contact_no}','${values.designation}','${req.user.companyId}','${NEW}','${config}','${req.user.userId}','${req.user.userId}') RETURNING leads.id`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return data;
};

const updateLeadDao = async (conn, req) => {
  const config = JSON.stringify(req.body.config);
  const sql = `UPDATE leads
   SET first_name = '${req.body.first_name}', last_name = '${req.body.last_name}', contact_no = '${req.body.contact_no}',
   designation = '${req.body.designation_id}', config = '${config}',
   updated_by = '${req.user.userId}'
   where leads.id = '${req.params.id}'
   AND leads.company = '${req.user.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deleteLeadDao = async (conn, req) => {
  const sql = `UPDATE leads
    SET is_obsolate = true,
    updated_by = '${req.user.userId}'
    where leads.id = '${req.params.id}'
    AND leads.company = '${req.user.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const getEmployeeLeadsDao = async (conn, user, companyId) => {
  const sql = `select le.id,
  l.first_name, l.last_name,
  l.contact_no,
  l.email,
  l.status,
  l.config,
  d.designation as designation,
  l.id as leadId
  from leads_employee_assignment as le
  join leads l on l.id=le.lead
  JOIN designations d ON d.id=l.designation
  where le.user = '${user}'
  and le.company = '${companyId}'
  and l.status IN ('New', 'Pending')
`;
  const data = await conn.query(sql);
  return data;
};

const transferLeadDao = async (conn, id, payload, token) => {
  const tId = generateUUID();
  const sql = `INSERT into leads_employee_assignment (id,lead,user,company,created_by,updated_by)
    values ('${tId}','${id}','${payload.employee_id}',
    '${token.companyId}','${token.userId}','${token.userId}')
    RETURNING leads_employee_assignment.id`;
  const data = await conn.query(sql);
  return data[0];
};

const updateTransferLeadNameDao = async (conn, id, payload, token) => {
  const sql = `update leads
  set config = json_set(config, '$.employee' , '${payload.employee}' )
  WHERE id = '${id}'
  AND company = '${token.companyId}'`;

  const data = await conn.query(sql);
  return data.affectedRows;
};

const updateEmployee = async (conn, id, companyId, payload) => {
  const config = JSON.stringify(payload);
  const sql = `update leads set config = '${config}'
  where id = '${id}'
  and company = '${companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deleteLeadsEmployeeAssignment = async (
  conn,
  leadId,
  employeeId,
  companyId
) => {
  const sql = `update leads_employee_assignment as la 
  JOIN leads l ON l.id = la.lead 
  set la.is_obsolate = true 
  where la.lead = '${leadId}' 
  and la.user = '${employeeId}'
  AND l.status IN ('${STATUS.NEW}', '${STATUS.PENDING}')
  and l.company = '${companyId}' `;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const getLeadsByStatusDao = async (
  conn,
  company,
  payload,
  status,
  lowerLevelId
) => {
  const params = [];
  let sql = `select l.id,
  l.first_name,  l.last_name,
  l.email,
  l.contact_no,
  d.designation as designation,
  l.status,
  l.config
  FROM leads as l
  JOIN designations d ON d.id=l.designation 
  AND l.company = '${company}'
  AND l.status = '${payload.status}'
  AND l.is_obsolate = false
`;
  if (status === false) {
    if (lowerLevelId && lowerLevelId.length > 0) {
      const placeholders = Array(lowerLevelId.length).fill('?').join(',');
      sql += ` AND l.created_by IN (${placeholders})`;
      params.push(...lowerLevelId);
    } else {
      return undefined;
    }
  }

  const data = await conn.query(sql, params);

  return data;
};

const getLeadsNewAndPending = async (conn, companyId, id) => {
  const sql = `select l.id,
  l.first_name,  l.last_name,
  l.email,
  l.contact_no,
  l.status,
  la.user as employee_id,
  l.config  
  FROM leads_employee_assignment as la
  JOIN leads l ON l.id = la.lead 
  WHERE l.company = '${companyId}'
  AND la.user = '${id}'
  AND l.status IN ('${STATUS.NEW}', '${STATUS.PENDING}')
  AND l.is_obsolate = false
`;
  const data = await conn.query(sql);

  return data;
};

const getLeadsByStatusLimitDao = async (
  conn,
  company,
  payload,
  offset,
  status,
  lowerLevelId
) => {
  const params = [];
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND (CONCAT(l.first_name, ' ', l.last_name) LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from leads as l
  where l.company = '${company}' 
  AND l.status = '${payload.status}'
  AND l.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);
  let sql = `select l.id,
  l.first_name,  l.last_name,
  l.email,
  l.contact_no,
  d.designation as designation,
  l.status,
  l.config
  FROM leads as l
  JOIN designations d ON d.id=l.designation
  AND l.company = '${company}'
  AND l.status = '${payload.status}'
  AND l.is_obsolate = false
  ${searchCondition}
  order by l.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;
  if (status === false) {
    if (lowerLevelId && lowerLevelId.length > 0) {
      const placeholders = Array(lowerLevelId.length).fill('?').join(',');
      sql += ` AND l.created_by IN (${placeholders})`;
      params.push(...lowerLevelId);
    } else {
      return undefined;
    }
  }
  const lead = await conn.query(sql, params);
  return { totalRowsValue, lead };
};

const updateTransferLeadDao = async (conn, lead, employee_id, token) => {
  const sql = `update leads_employee_assignment
  SET user = '${employee_id}', updated_by = '${token.userId}'
  WHERE lead = '${lead}'
  AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const rejectLeadDao = async (conn, id, payload, token) => {
  const config = JSON.stringify(payload.config);
  const sql = `update leads
  SET config = '${config}', updated_by = '${token.userId}', status = '${REJECTED}'
  WHERE leads.id = '${id}'
  AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const leadRecordDao = async (conn, id, token) => {
  const sql = `select * from leads
    where id = '${id}'
    and company = '${token.companyId}'
    and is_obsolate = false`;
  const data = await conn.query(sql);
  if (data) {
    return data;
  }
  return undefined;
};

const approveLeadDao = async (conn, id, token) => {
  const sql = `update leads
  SET status = '${APPROVED}',  updated_by = '${token.userId}'
  WHERE leads.id = '${id}'
  AND company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const getEmployeeByLeadsIdDao = async (conn, lead, token) => {
  const sql = `select le.user
  from leads_employee_assignment as le
  where le.lead = '${lead}'
  and le.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

export {
  getAllLeadsDao,
  getAllLeadsLimitDao,
  getLeadByIdDao,
  getLeadByContactNoDao,
  addLeadDao,
  updateLeadDao,
  deleteLeadDao,
  getEmployeeLeadsDao,
  transferLeadDao,
  updateTransferLeadNameDao,
  getLeadsByStatusDao,
  getLeadsByStatusLimitDao,
  multipleAddLeadDao,
  updateTransferLeadDao,
  rejectLeadDao,
  leadRecordDao,
  approveLeadDao,
  getEmployeeByLeadsIdDao,
  updateEmployee,
  getLeadsNewAndPending,
  deleteLeadsEmployeeAssignment,
};
