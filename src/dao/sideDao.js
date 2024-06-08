const getAllCountsDao = async (
  conn,
  companyId,
  vendorRoleId,
  employeeRoleId
) => {
  const regionSql = `select COUNT(*) as totalRows 
    from regions as r
    where r.company = '${companyId}' 
    AND r.is_obsolate = false`;
  const regionData = await conn.query(regionSql);
  const totalRegionRows = regionData[0]?.totalRows;
  const totalRegionValue = Number(totalRegionRows);

  const vendorDesignationSql = `select COUNT(*) as totalRows 
  from designations as d
  where d.company = '${companyId}' 
  and d.role = '${vendorRoleId}'
  AND d.is_obsolate = false`;
  const vendorDesignationData = await conn.query(vendorDesignationSql);
  const totalVendorDesignationRows = vendorDesignationData[0]?.totalRows;
  const totalVendorDesignationValue = Number(totalVendorDesignationRows);

  const employeeDesignationSql = `select COUNT(*) as totalRows 
  from designations as d
  where d.company = '${companyId}' 
  and d.role = '${employeeRoleId}'
  AND d.is_obsolate = false`;
  const employeeDesignationData = await conn.query(employeeDesignationSql);
  const totalEmployeeDesignationRows = employeeDesignationData[0]?.totalRows;
  const totalEmployeeDesignationValue = Number(totalEmployeeDesignationRows);

  const hierarchySql = `select JSON_LENGTH(JSON_EXTRACT(config, '$.relations')) as totalRows 
  from designation_hierarchy as dh
  where dh.company = '${companyId}' 
  AND dh.is_obsolate = false`;
  const hierarchyData = await conn.query(hierarchySql);
  const totalHierarchyRows = hierarchyData[0]?.totalRows;
  const totalHierarchyValue = Number(totalHierarchyRows);

  const unitSql = `select COUNT(*) as totalRows 
  from units1 as u
  where u.company = '${companyId}' 
  AND u.is_obsolate = false`;
  const unitData = await conn.query(unitSql);
  const totalUnitRows = unitData[0]?.totalRows;
  const totalUnitValue = Number(totalUnitRows);

  const productSql = `select COUNT(*) as totalRows 
  from products as p
  where p.company = '${companyId}' 
  AND p.is_obsolate = false`;
  const productData = await conn.query(productSql);
  const totalProductRows = productData[0]?.totalRows;
  const totalProductValue = Number(totalProductRows);

  const packageSql = `select COUNT(*) as totalRows 
  from packages as p
  where p.company = '${companyId}'
  AND p.is_obsolate = false`;
  const packagesData = await conn.query(packageSql);
  const totalPackageRows = packagesData[0]?.totalRows;
  const totalPackagesValue = Number(totalPackageRows);

  const categorySql = `select COUNT(*) as totalRows 
  from product_categories as pc
  where pc.company = '${companyId}' 
  AND pc.is_obsolate = false`;
  const categoryData = await conn.query(categorySql);
  const totalCategoryRows = categoryData[0]?.totalRows;
  const totalCategoryValue = Number(totalCategoryRows);

  const vendorsSql = `select COUNT(*) as totalRows 
  from users as u
  where u.company = '${companyId}'
  AND u.role = '${vendorRoleId}' 
  AND u.is_obsolate = false`;
  const vendorsData = await conn.query(vendorsSql);
  const totalVendorRows = vendorsData[0]?.totalRows;
  const totalVendorsValue = Number(totalVendorRows);

  const employeesSql = `select COUNT(*) as totalRows 
  from users as u
  where u.company = '${companyId}'
  AND u.role = '${employeeRoleId}' 
  AND u.is_obsolate = false`;
  const employeesData = await conn.query(employeesSql);
  const totalEmployeeRows = employeesData[0]?.totalRows;
  const totalEmployeesValue = Number(totalEmployeeRows);

  return {
    totalRegionValue,
    totalVendorDesignationValue,
    totalEmployeeDesignationValue,
    totalHierarchyValue,
    totalUnitValue,
    totalPackagesValue,
    totalProductValue,
    totalCategoryValue,
    totalVendorsValue,
    totalEmployeesValue,
  };
};

export default getAllCountsDao;
