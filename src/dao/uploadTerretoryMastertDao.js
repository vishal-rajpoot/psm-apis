const uploadTerretoryReportDao = async (
  conn,
  token,
  generalManagers,
  zonalManagers,
  regionalManagers,
  territories
) => {
  const fetchSql = `SELECT config FROM companies WHERE id = '${token.companyId}'`;
  const fetchData = await conn.query(fetchSql);
  const config = fetchData[0].config || {};
  if (!config.territory_master) {
    config.territory_master = {
      general_managers: generalManagers,
      zonal_managers: zonalManagers,
      regional_managers: regionalManagers,
      Territories: territories,
    };
  } else {
    config.territory_master.general_managers = generalManagers;
    config.territory_master.zonal_managers = zonalManagers;
    config.territory_master.regional_managers = regionalManagers;
    config.territory_master.territories = territories;
  }
  const updateSql = `UPDATE companies SET config = ? WHERE id = '${token.companyId}'`;
  await conn.query(updateSql, [JSON.stringify(config)]);
  return 1;
};

const getTerreroryDetilsDao = async (conn, token) => {
  const sql = `SELECT config FROM companies WHERE id = '${token.companyId}'`;
  const [result] = await conn.query(sql);
  if (!result.config && !result.config.territory_master) {
    return null;
  }
  const { territory_master } = result.config;
  return territory_master;
};

export { uploadTerretoryReportDao, getTerreroryDetilsDao };
