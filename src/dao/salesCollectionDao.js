import { generateUUID } from '../utils/helper';
import { ACTIVE } from '../utils/constants';

const getDistributotByCodeDao = async (conn, companyId, code) => {
  const sql = `select *
  FROM users as us
  WHERE us.company = '${companyId}'
  AND JSON_EXTRACT(us.config, '$.code') = ? 
  AND us.is_obsolate = false`;
  const params = [code];
  const data = await conn.query(sql, params);
  if (data[0]) {
    return data[0];
  }
  return undefined;
};
const addSalesCollectiondao = async (conn, token, user) => {
  const configData = JSON.stringify(user.config);
  const id = generateUUID();
  const sql = `INSERT INTO user_activities (id,user,event_type, config,company)
    VALUES ('${id}', '${token.userId}','${user.event_type}','${configData}','${token.companyId}')
    RETURNING user_activities.id`;
  const data = await conn.query(sql);
  return data[0];
};

export { getDistributotByCodeDao, addSalesCollectiondao };
