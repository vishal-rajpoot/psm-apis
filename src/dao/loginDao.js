import { generateUUID } from '../utils/helper';
import { FALSE, LOGOUT } from '../utils/constants';

const addLoginDao = async (conn, userId, config, companyId) => {
  const configData = JSON.stringify(config);
  const id = generateUUID();
  const sql = `insert into login (id, username, config, is_obsolate, company)
    values('${id}','${userId}', '${configData}', ${FALSE}, '${companyId}')
    RETURNING*`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const updateDao = async (conn, companyId, userId, config) => {
  const configData = JSON.stringify(config);
  const sql = `update login
    set config = '${configData}'
    where username = '${userId}'
    and company = '${companyId}'
    order by created_at DESC LIMIT 1`;
  const data = await conn.query(sql);
  return data[0];
};

const logoutDao = async (conn, decodeToken) => {
  const sql = `update login
    set event = '${LOGOUT}'
    where id = '${decodeToken.loginId}'
    and company = '${decodeToken.companyId}'`;
  const data = await conn.query(sql);
  return data[0];
};

export { addLoginDao, logoutDao, updateDao };
