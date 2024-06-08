import { generateUUID } from '../utils/helper';

const getAllCategoryDao = async (conn, company) => {
  const sql = `select pc.id, pc.category_name, u1.first_name as updated_by_firstName, u1.last_name as updated_by_lastName, pc.status
  FROM product_categories pc INNER JOIN users u1 ON u1.id=pc.updated_by 
  WHERE pc.company = '${company}'
  AND pc.is_obsolate = false
  ORDER BY pc.created_at DESC
`;
  const category = await conn.query(sql);
  if (category && category[0]) {
    return { category };
  }
  return undefined;
};

const getAllCategoryLimitDao = async (conn, company, payload, offset) => {
  let searchCondition = '';
  if (payload.searchText) {
    searchCondition = `AND pc.category_name LIKE '%${payload.searchText}%'`;
  }
  const countSql = `select COUNT(*) as totalRows 
  from product_categories pc
  where pc.company = '${company}' 
  AND pc.is_obsolate = false
  ${searchCondition}`;
  const countData = await conn.query(countSql);
  const { totalRows } = countData[0];
  const totalRowsValue = Number(totalRows);

  const sql = `select pc.id, pc.category_name, u1.first_name as updated_by_firstName, u1.last_name as updated_by_lastName, pc.status
  FROM product_categories pc INNER JOIN users u1 ON u1.id=pc.updated_by
  WHERE pc.company = '${company}'
  AND pc.is_obsolate = false
  ${searchCondition} 
  order by pc.${payload.column} ${payload.sort}
  LIMIT ${payload.limit} OFFSET ${offset}`;
  const category = await conn.query(sql);
  if (category && category[0]) {
    return { totalRowsValue, category };
  }
  return undefined;
};

const getCategoriesNameandIdDao = async (conn, companyId) => {
  const sql = `select pc.id, pc.category_name
  FROM product_categories pc
  WHERE pc.company = '${companyId}'
  AND pc.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data;
  }
  return undefined;
};

const getCategoryByIdDao = async (conn, company, id) => {
  const sql = `select
  pc.id,
  pc.category_name,
  u.first_name as updated_by_firstName,
  u.last_name as updated_by_lastName,
  pc.status
  FROM product_categories as pc JOIN users u ON u.id=pc.updated_by
  WHERE
  pc.company = '${company}'
  AND pc.id = '${id}'
  AND pc.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data && data[0]) {
    return data[0];
  }
  return undefined;
};

const getCategoryByNameDao = async (conn, companyId, name) => {
  const sql = `select *
  FROM product_categories as pc
  WHERE pc.company = '${companyId}'
  AND pc.category_name = '${name}'
  AND pc.is_obsolate = false`;
  const data = await conn.query(sql);
  if (data[0]) {
    return data[0];
  }
  return undefined;
};

const addCategoryDao = async (conn, companyId, userId, name) => {
  const id = generateUUID();
  const sql = `INSERT INTO product_categories (id,category_name, company, created_by, updated_by)
  VALUES ('${id}', '${name}','${companyId}', '${userId}', '${userId}')
  RETURNING product_categories.id`;
  const data = await conn.query(sql);
  console.log(data);
  return data[0];
};
const addCategoryForMeghmaniDao = async (conn, companyId, userId, name) => {
  const id = generateUUID();
  const sql = `INSERT INTO product_categories (id,category_name, company, created_by, updated_by)
  VALUES ('${id}', '${name}','${companyId}', '${userId}', '${userId}')
  RETURNING product_categories.id`;
  const data = await conn.query(sql);
  const category = {
    id: data[0].id,
    category_name: name,
  };

  return category;
};

const updateCategoryDao = async (conn, id, token, payload) => {
  const sql = `UPDATE product_categories
  SET status = '${payload.status}', category_name = '${payload.category_name}', updated_by = '${token.userId}'
  WHERE product_categories.id = '${id}'
  AND product_categories.company = '${token.companyId}'`;
  const data = await conn.query(sql);
  return data.affectedRows;
};

const deleteCategoryDao = async (conn, id, companyId, userId) => {
  const sql = `UPDATE product_categories
  SET is_obsolate = true , updated_by = '${userId}'
  WHERE product_categories.id = '${id}'
  AND product_categories.company = '${companyId}'`;
  const data = await conn.query(sql);
  if (data) {
    return data.affectedRows;
  }
  return undefined;
};

export {
  getAllCategoryDao,
  getAllCategoryLimitDao,
  getCategoryByIdDao,
  addCategoryDao,
  updateCategoryDao,
  deleteCategoryDao,
  getCategoryByNameDao,
  getCategoriesNameandIdDao,
  addCategoryForMeghmaniDao,
};
