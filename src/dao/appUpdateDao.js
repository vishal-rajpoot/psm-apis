const getAppUpdateDetailDao = async (conn) => {
  const sql = `select au.id,
   au.current_version,
   au.old_version,
   au.release_notes,
   au.is_force,
   DATE_FORMAT(au.created_at, '%d/%m/%Y') as date
  FROM app_update au
  WHERE au.is_obsolate = false
  order by created_at DESC LIMIT 1`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

export default getAppUpdateDetailDao;
