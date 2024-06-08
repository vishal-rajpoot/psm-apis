import { generateUUID } from '../utils/helper';

const getStocksLimitDao = async (conn, companyId, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND ps.product LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from product_stocks as ps
  where ps.company = '${companyId}' 
  AND ps.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select 
  DATE_FORMAT(ps.updated_at, '%d/%m/%Y') as date,
  ps.id as stock_id,
  ps.product as product_id,
  p.product_name,
  p.product_hsncode,
  ps.quantity,
  pc.category_name,
  ps.batch_code
  from product_stocks as ps
  JOIN products p ON p.id=ps.product
  JOIN product_categories as pc ON p.category=pc.id
  where ps.company = '${companyId}'
  AND ps.is_obsolate = false
  ${searchCondition}
  order by ps.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const stocks = await conn.query(sql);
  if (stocks && stocks[0]) {
    return { totalRowsValue, stocks };
  }
  return undefined;
};

const getStocksDao = async (conn, companyId, payload) => {
  const sql = `select 
  DATE_FORMAT(ps.updated_at, '%d/%m/%Y') as date,
  ps.id as stock_id,
  ps.product as product_id,
  p.product_name,
  p.product_hsncode,
  ps.quantity,
  pc.category_name,
  ps.batch_code
  from product_stocks as ps
  JOIN products p ON p.id=ps.product
  JOIN product_categories as pc ON p.category=pc.id
  where ps.company = '${companyId}'
  and ps.is_obsolate = false
  order by ps.${payload.column} ${payload.sort}

`;
  const stocks = await conn.query(sql);
  if (stocks && stocks[0]) {
    return { stocks };
  }
  return undefined;
};

const getStocksByIdDao = async (conn, req, id) => {
  const sql = `select
  DATE_FORMAT(ps.updated_at, '%d/%m/%Y') as date,
  ps.id as stock_id,
  ps.product as product_id,
  p.product_name,
  p.product_hsncode,
  ps.quantity,
  pc.category_name,
  ps.batch_code
  from product_stocks as ps
  JOIN products p ON p.id=ps.product
  JOIN product_categories as pc ON p.category=pc.id
  where ps.company = '${req.user.companyId}'
  AND ps.id = '${id}'
  AND ps.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const getStocksQuantityByIdDao = async (conn, id, companyId) => {
  const sql = `select
  ps.id as stock_id,
  ps.product as product_id,
  ps.quantity,
  ps.batch_code
  from product_stocks as ps
  where ps.company = '${companyId}'
  and ps.id = '${id}'
  AND ps.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const addStockDao = async (conn, user, body) => {
  const batchCode = body.batch_code || '';
  const id = generateUUID();
  const sql = `INSERT into
    product_stocks (id,product,quantity,batch_code,company, created_by, updated_by)
    values ('${id}','${body.productId}','${body.quantity}','${batchCode}',
    '${user.companyId}','${user.userId}','${user.userId}')
    RETURNING product_stocks.id`;
  const sql2 = `update products
    SET quantity = CASE WHEN quantity IS NULL THEN ${body.quantity} 
        ELSE quantity + ${body.quantity}
        END
    where products.id = '${body.productId}'
    and products.company = '${user.companyId}'`;
  const data = await conn.query(sql);
  await conn.query(sql2);
  return data[0];
};

const updateStockDao = async (conn, req, id, checkStock) => {
  const sql = `update
    product_stocks set product='${req.body.productId}',quantity='${req.body.quantity}'
    where product_stocks.id = '${id}'
    and product_stocks.company = '${req.user.companyId}'`;
  const sql2 = `update products
    SET quantity = quantity + ${req.body.quantity} - ${checkStock.quantity}
    where products.id = '${req.body.productId}'
    and products.company = '${req.user.companyId}'`;
  const data = await conn.query(sql);
  await conn.query(sql2);
  return data[0];
};

const removeStockDao = async (conn, id, companyId, checkStock) => {
  const sql = `update product_stocks set is_obsolate = true
  where id = '${id}'
  and product_stocks.company = '${companyId}'`;
  const sql2 = `update products
    SET quantity = quantity - ${checkStock.quantity}
    where products.id = '${checkStock.product_id}'
    and products.company = '${companyId}'`;
  const data = await conn.query(sql);
  await conn.query(sql2);

  if (data && data[0]) {
    return data;
  }
  return undefined;
};

export {
  getStocksDao,
  addStockDao,
  getStocksByIdDao,
  getStocksLimitDao,
  updateStockDao,
  getStocksQuantityByIdDao,
  removeStockDao,
};
