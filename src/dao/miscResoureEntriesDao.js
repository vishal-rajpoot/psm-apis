import { generateUUID } from '../utils/helper';

const getMiscResoureEntriesDao = async (conn, token, resourcetype) => {
  const sql = `select * from misc_resource_entries
  where user = '${token.userId}' and company = '${token.companyId}' and resource_type='${resourcetype}'`;
  const data = await conn.query(sql);

  return data;
};

const addMiscResoureEntriesDao = async (conn, token, payload) => {
  const id = generateUUID();
  const config = JSON.stringify(payload.config);
  const sql = `insert into misc_resource_entries(id, user, resource_type, config, company)
  values('${id}', '${token.userId}', '${payload.resource_type}', '${config}', '${token.companyId}')`;
  const data = await conn.query(sql);
  return data[0];
};
export { getMiscResoureEntriesDao, addMiscResoureEntriesDao };
