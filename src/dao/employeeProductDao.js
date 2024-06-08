import { generateUUID } from '../utils/helper';

const addProductToEmployeeDao = async (conn, payload) => {
  const product = JSON.stringify({ product_ids: [payload.id] });
  const sql = `UPDATE employee_product_access
  SET config = CASE
      WHEN config IS NULL THEN '${product}'
      WHEN JSON_CONTAINS(JSON_EXTRACT(config, '$.product_ids'), JSON_QUOTE('${payload.id}')) THEN config
      ELSE JSON_ARRAY_APPEND(config, '$.product_ids', '${payload.id}')
    END,
    updated_by = '${payload.token.userId}'
  WHERE employee IN (${payload.employees})
  AND company = '${payload.token.companyId}'`;
  const data = await conn.query(sql);

  return data;
};

const removeProductToEmployeeDao = async (conn, payload) => {
  const sql = `UPDATE employee_product_access
    SET config = CASE
      WHEN JSON_CONTAINS(JSON_EXTRACT(config, '$.product_ids'), JSON_QUOTE('${payload.id}'))
      THEN JSON_REMOVE(config, JSON_UNQUOTE(JSON_SEARCH(config, 'one', '${payload.id}')))
      ELSE config
    END,
    updated_by = '${payload.token.userId}'
  WHERE employee NOT IN (${payload.employees})
  AND company = '${payload.token.companyId}'`;
  const data = await conn.query(sql);

  return data;
};

const addNewEmployeeToProductToEmployeeDao = async (conn, payload) => {
  const config = JSON.stringify(payload.config);
  const id = generateUUID();
  const sql = `insert into employee_product_access(id, employee, config,
  company, created_by, updated_by)
  values('${id}', '${payload.employee}', '${config}', '${payload.token.companyId}', '${payload.token.userId}','${payload.token.userId}' )`;
  const data = await conn.query(sql);

  return data;
};

const getAllEmployeesAssignedToProductIdDao = async (conn, id, token) => {
  const sql = ` select employee as id, CONCAT(u.first_name, ' ', u.last_name) as full_name
    from employee_product_access as e
    JOIN users u on u.id = e.employee
    WHERE JSON_CONTAINS(JSON_EXTRACT(e.config, '$.product_ids'), '"${id}"')
    AND e.company = '${token.companyId}'
`;
  const data = await conn.query(sql);
  return data;
};

const getAllUnassignedEmployeesForProductIdDao = async (
  conn,
  id,
  token,
  role_id
) => {
  const sql = ` select u.id, CONCAT(u.first_name, ' ', u.last_name) as full_name
  from users as u
  WHERE id NOT IN (
    select employee
    from employee_product_access as e
    WHERE JSON_CONTAINS(JSON_EXTRACT(e.config, '$.product_ids'), '"${id}"')
    AND e.company = '${token.companyId}'
  )
  AND u.role = '${role_id}'
  AND u.company = '${token.companyId}'
  AND u.is_obsolate = false
`;
  const data = await conn.query(sql);
  return data;
};

export {
  addProductToEmployeeDao,
  removeProductToEmployeeDao,
  addNewEmployeeToProductToEmployeeDao,
  getAllEmployeesAssignedToProductIdDao,
  getAllUnassignedEmployeesForProductIdDao,
};
