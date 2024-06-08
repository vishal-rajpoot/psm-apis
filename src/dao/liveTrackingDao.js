import { generateUUID } from '../utils/helper';

const getLiveTrackingDao = async (conn, token, userId, date) => {
  const sql = `select t.id,
    DATE_FORMAT(t.tracking_date, '%d/%m/%Y') as date,
    t.config
    FROM user_tracking as t
    WHERE t.company = '${token.companyId}'
    AND t.user = '${userId}'
    AND t.tracking_date = '${date}'
    AND t.is_obsolate = false`;
  const data = await conn.query(sql);

  if (data && data.length > 0) {
    return data;
  }
  return data;
};

const addLiveTrackingDao = async (conn, token, payload) => {
  const config = JSON.stringify(payload.live_tracking);
  const id = generateUUID();
  const sql = `insert into user_tracking
    (id,user,tracking_date,config,company,created_by,updated_by)
    values ('${id}','${token.userId}','${payload.tracking_date}','${config}','${token.companyId}',
     '${token.userId}','${token.userId}')
    RETURNING user_tracking.id`;
  const data = await conn.query(sql);
  return data[0];
};

// revisit
const updateLiveTrackingDao = async (conn, id, token, formattedObject) => {
  const sql = `update user_tracking
  SET config = CONCAT(
    LEFT(config, CHAR_LENGTH(config) - 1),
    ',${formattedObject}]'
  )
    where user_tracking.company = '${token.companyId}'
    and user_tracking.user = '${token.userId}'
    and user_tracking.id = '${id}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

export { getLiveTrackingDao, addLiveTrackingDao, updateLiveTrackingDao };
