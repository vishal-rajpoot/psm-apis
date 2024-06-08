const getConfigDao = async (conn, payload) => {
  let sql;
  const params = [payload.companyId, payload.userId];
  if (payload.key) {
    sql = `SELECT JSON_EXTRACT(config, '$.${payload.key}') AS config_value FROM ${payload.model} WHERE company = ? AND user=? AND is_obsolate = false`;
  } else {
    sql = `SELECT ${payload.config ? 'config' : '*'} FROM ${
      payload.model
    } WHERE company = ? AND user = ? AND is_obsolate = false`;
  }
  if (payload.id) {
    sql += ' AND id = ?';
    params.push(payload.id);
  }

  const data = await conn.query(sql, params);
  if (data) {
    return data;
  }
  return undefined;
};

export default getConfigDao;
