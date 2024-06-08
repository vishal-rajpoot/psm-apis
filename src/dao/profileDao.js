const getProfileDao = async (conn, token) => {
  const sql = `select u.id,
  u.first_name,
  u.last_name,
  u.config,
  d.designation,
  d.id as designation_id,
  u.contact_no,
  u.status,
  r.role,
  r.id as role_id,
  u.email,
  c.name as company_name,
  c.email as company_email,
  c.contact_no as company_contact_no,
  c.address as company_address,
  c.city as company_city,
  c.state as company_state,
  c.country as company_country,
  c.pincode as company_pincode,
  c.config as company_config
  from users as u
  join roles as r on u.role = r.id
  join designations as d on u.designation = d.id
  join companies as c on u.company = c.id
  where u.company = '${token.companyId}'
  and u.id = '${token.userId}'
  and u.is_obsolate = false `;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const updateProfileFlagDao = async (conn, token, id, flag) => {
  const sql = `UPDATE users AS u
  SET u.config = JSON_SET(config, '$.flag', ${flag})
  WHERE u.id = '${id}'
  AND u.company = '${token.companyId}'
  AND u.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data) {
    const profile = data.affectedRows;
    return profile;
  }
  return undefined;
};

export { getProfileDao, updateProfileFlagDao };
