import { generateUUID } from '../utils/helper';

const getMettingServiceDao = async (conn, token, date) => {
  const sql = `
      SELECT * FROM user_activities
      WHERE event_type IN ('meeting_distributor_meet', 'meeting_newparty_coSntact', 'organized_farmer_meeting','spot_farmer_meetting','individual_farmer_connect','demo_conducted','field_day','meeting_other')
      AND company = '${token.companyId}'
      AND user='${token.user_id}'
      AND DATE(JSON_UNQUOTE(JSON_EXTRACT(config, '$[0].date'))) = '${date}'`;

  const data = await conn.query(sql);
  delete data.meta;
  return data;
};

const getExecuteMettingServiceDao = async (conn, token, date) => {
  const sql = `
    SELECT * FROM user_activities
    WHERE event_type IN ('meeting_distributor_meet', 'meeting_newparty_cosntact', 'organized_farmer_meeting','spot_farmer_meetting','individual_farmer_connect','demo_conducted','field_day','meeting_other')
    AND user = '${token.userId}' 
    AND company = '${token.companyId}'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$[0].date')) = '${date}'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$[0].is_execute')) = '1'`;
  const data = await conn.query(sql);
  return data;
};
const getListMettingServiceDao = async (conn, token, startdate, enddate) => {
  const sql = `
  SELECT ua.*, CONCAT(u.first_name, ' ', u.last_name) AS name 
    FROM user_activities AS ua
    INNER JOIN users AS u ON ua.user = u.id
    WHERE ua.event_type IN ('meeting_distributor_meet', 'meeting_newparty_cosntact', 'organized_farmer_meeting','spot_farmer_meetting','individual_farmer_connect','demo_conducted','field_day','meeting_other')
    AND ua.company = '${token.companyId}'
    AND JSON_UNQUOTE(JSON_EXTRACT(ua.config, '$[0].date')) BETWEEN '${startdate}' AND '${enddate}'`;

  const data = await conn.query(sql);

  return data;
};

const getScheduleMettingServiceDao = async (conn, token, date) => {
  const sql = `
    SELECT * FROM user_activities
    WHERE event_type IN ('meeting_distributor_meet', 'meeting_newparty_cosntact', 'organized_farmer_meeting','spot_farmer_meetting','individual_farmer_connect','demo_conducted','field_day','meeting_other')
    AND user = '${token.userId}' 
    AND company = '${token.companyId}'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$[0].date')) = '${date}'
    AND JSON_UNQUOTE(JSON_EXTRACT(config, '$[0].is_execute')) = '0'`;

  const data = await conn.query(sql);
  if (data) {
    return { data };
  }
  return undefined;
};

const getMeetingByIdDao = async (id, company, conn) => {
  const sql = `
    SELECT * FROM user_activities
    WHERE id = '${id}' 
    AND company = '${company}';
  `;
  const data = await conn.query(sql);
  if (data[0]) {
    delete data.meta;
    return { data };
  }
  return undefined;
};
const addMeetingDao = async (conn, userId, payload, companyId) => {
  const id = generateUUID();
  const { event_type, config } = payload;
  const jsonStringConfig = JSON.stringify(config);
  const sql = `
    INSERT INTO user_activities (id, user, event_type, config, company)
    VALUES ('${id}', '${userId}', '${event_type}', '${jsonStringConfig}', '${companyId}')
    RETURNING user_activities.id`;

  const data = await conn.query(sql);
  return data[0];
};

export {
  getMettingServiceDao,
  getMeetingByIdDao,
  addMeetingDao,
  getExecuteMettingServiceDao,
  getScheduleMettingServiceDao,
  getListMettingServiceDao,
};
