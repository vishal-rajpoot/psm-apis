import { generateUUID } from '../utils/helper';

const getPriceListDao = async (conn, token, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND p.region LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from price_master as p
  where p.company = '${token.companyId}' 
  AND p.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select
  p.id ,
  r.region,
  p.config,
  p.price
  from price_master as p
  JOIN regions r on r.id=p.region
  where p.company = '${token.companyId}'
  and p.is_obsolate = false
  ${searchCondition}
  order by p.${payload.column} ${payload.sort} 
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const price = await conn.query(sql);
  if (price && price[0]) {
    return { totalRowsValue, price };
  }
  return undefined;
};

const addPriceDao = async (conn, payload, token) => {
  const config = JSON.stringify(payload.config);
  const id = generateUUID();
  const sql = `INSERT into
    price_master (id,region,config,price,company,created_by, updated_by)
    values ('${id}','${payload.region}','${config}','${payload.price}',
    '${token.companyId}','${token.userId}','${token.userId}')
    RETURNING price_master.id`;
  const data = await conn.query(sql);
  return data[0];
};

const updatePriceDao = async (conn, payload, id, token) => {
  const config = JSON.stringify(payload.config);
  const sql = `update price_master
    set price = '${payload.price}', config = '${config}', updated_by = '${token.userId}'
    where price_master.id = '${id}'
    and price_master.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deletePriceDao = async (conn, id, token) => {
  const sql = `update price_master
    set is_obsolate = true, updated_by = '${token.userId}'
    where price_master.id = '${id}'
    and price_master.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

export { getPriceListDao, addPriceDao, updatePriceDao, deletePriceDao };
