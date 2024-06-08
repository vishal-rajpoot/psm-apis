const getTaxDao = async (conn, companyId) => {
  const sql = `SELECT JSON_EXTRACT(config, '$.tax') AS tax, 
    JSON_EXTRACT(config, '$.gst') AS gst
    FROM companies
    WHERE id = '${companyId}'
    AND is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const updateTaxDao = async (conn, companyId, payload) => {
  let sql;
  if (payload.gst) {
    sql = `UPDATE companies
           SET config = JSON_SET(JSON_SET(config, '$.tax', ${payload.tax}), '$.gst', ${payload.gst})
           WHERE id = '${companyId}'`;
  } else {
    sql = `UPDATE companies
           SET config = JSON_SET(config, '$.tax', ${payload.tax})
           WHERE id = '${companyId}'`;
  }
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

export { getTaxDao, updateTaxDao };
