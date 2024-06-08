import { generateUUID } from '../utils/helper';

const addUserActivitiesDao = async (conn, req, config, event_type) => {
  const configData = JSON.stringify(config);
  const id = generateUUID();
  const sql = `INSERT INTO user_activities (id,user,event_type, config,company)
    VALUES ('${id}', '${req.user.userId}','${event_type}','${configData}','${req.user.companyId}')
    RETURNING user_activities.id`;
  const data = await conn.query(sql);
  return data[0];
};

const addLeadActivitiesDao = async (conn, leadId, req, config, event_type) => {
  const configData = JSON.stringify(config);
  const id = generateUUID();
  const sql = `INSERT INTO lead_activities (id,lead,event_type, config,company,created_by,updated_by)
    VALUES ('${id}', '${leadId}','${event_type}','${configData}','${req.user.companyId}', '${req.user.userId}', '${req.user.userId}')
    RETURNING lead_activities.id`;
  const sql2 = `update leads 
    SET status = 'Pending', updated_by = '${req.user.userId}'
    WHERE id = '${leadId}'
    AND company = '${req.user.companyId}'`;
  await conn.query(sql2);
  const data = await conn.query(sql);
  return data[0];
};

const getLeadsBytempIdDao = async (conn, tempId) => {
  const sql = `select l.id
    FROM leads as l
    WHERE JSON_EXTRACT(l.config, '$.buyer_id') = '${tempId}'
    AND l.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};
const addFarmerMiscResoureEntriesDao = async (conn, req, config) => {
  const id = generateUUID();
  const configData = JSON.stringify(config);
  const sql = `insert into misc_resource_entries(id, user, resource_type, config, company)
  values('${id}', '${req.user.userId}', 'farmer', '${configData}', '${req.user.companyId}')
  RETURNING misc_resource_entries.id`;
  const data = await conn.query(sql);
  return data[0];
};
const excuteMeeting = async (conn, req, scheduleId, config) => {
  const modifiedConfig = { ...config };
  modifiedConfig.is_execute = '1';
  const configData = JSON.stringify(modifiedConfig);
  const sql = `UPDATE user_activities 
                 SET config = ?
                 WHERE id = ?`;
  const result = await conn.query(sql, [configData, scheduleId]);
  if (result) {
    return result.affectedRows;
  }
  return undefined;
};

export {
  addUserActivitiesDao,
  addLeadActivitiesDao,
  getLeadsBytempIdDao,
  excuteMeeting,
  addFarmerMiscResoureEntriesDao,
};
