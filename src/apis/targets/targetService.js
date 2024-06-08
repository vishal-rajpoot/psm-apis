/* eslint-disable no-plusplus */
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getTotalRevenueByMonthDao,
  getTotalRevenueRegionWiseByYearDao,
  getTotalRevenueRegionWiseByMonthDao,
  getTotalRevenueByYearDao,
  getActivityHistoryCountDao,
  getOrderApprovedCountDao,
  getRevenueCountDao,
  addTargetDao,
  getTotalRevenueForMonthByIdDao,
  getTotalRevenueForYearByIdDao,
  getTargetListDao,
  childEmployeeCountDao,
  updateTargetDao,
  updateTargetByIdDao,
  filterTargetListDao,
  getTargetHierarchyDao,
  deleteTargetDao,
} from '../../dao/targetDao';
import { getAllEmployeesAssignedByManagerIdDao } from '../../dao/userManagementDao';
import {
  getUsersByDesignationDao,
  getUserByIdDao,
  fetchDesignationRole,
  fetchEmployeeHierarchy,
} from '../../dao/userDao';

const logger = new Logger();

const getTotalRevenueByCompanyService = async (
  payload,
  region,
  userId,
  designationId,
  companyId
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    if (payload.month) {
      let monthData;
      let data;
      let status = false;
      let lowerLevelId = [];
      const designation = await fetchDesignationRole(
        conn,
        companyId,
        designationId
      );
      if (designation && designation.designation === 'Admin') {
        status = true;
      } else {
        lowerLevelId = await fetchEmployeeHierarchy(conn, userId, companyId);
        lowerLevelId.push(userId);
      }
      if (region !== undefined) {
        monthData = await getTotalRevenueRegionWiseByMonthDao(
          conn,
          payload,
          region,
          status,
          lowerLevelId
        );
        data = await getTotalRevenueRegionWiseByYearDao(
          conn,
          payload,
          region,
          status,
          lowerLevelId
        );
      } else {
        monthData = await getTotalRevenueByMonthDao(
          conn,
          payload,
          status,
          lowerLevelId
        );
        data = await getTotalRevenueByYearDao(
          conn,
          payload,
          status,
          lowerLevelId
        );
      }
      const ActivityCount = await getActivityHistoryCountDao(
        conn, 
        payload,
        status,
        lowerLevelId
      );
      const ApprovedCount = await getOrderApprovedCountDao(
        conn,
        payload,
        status,
        lowerLevelId
      );
      const revenueAmount = await getRevenueCountDao(
        conn,
        payload,
        status,
        lowerLevelId
      );
      const ActivityCountValue = Number(ActivityCount.row_count);
      const ApprovedCountValue = Number(ApprovedCount.row_count);

      const revenue = {
        revenue_count: revenueAmount?.revenue_amount || '0',
        activity_count: ActivityCountValue || '0',
        order_approved_count: ApprovedCountValue || '0',
        montly_target: monthData.total_monthly_targets ?? '0',
        monthly_revenue: monthData.total_monthly_revenue ?? '0',
        yearly_target: data.total_yearly_targets ?? '0',
        yearly_revenue: data.total_yearly_revenue ?? '0',
      };
      return revenue;
    }
    const data = await getTotalRevenueByYearDao(conn, payload, region);
    const revenue = {
      yearly_target: data.total_yearly_targets ?? '0',
      yearly_revenue: data.total_yearly_revenue ?? '0',
    };
    return revenue;
  } catch (err) {
    logger.log('error while getting revenue by company', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addTargetService = async (targetObject) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    for (const data of targetObject.payload.target) {
      const getData = await filterTargetListDao(
        conn,
        targetObject,
        data.target_user
      );
      if (getData !== undefined) {
        const company = targetObject.token.companyId;
        const amount = data.target_amount;
        await updateTargetDao(conn, company, getData, amount);
      } else {
        await addTargetDao(conn, targetObject);
      }
    }

    await conn.commit();
    return {};
  } catch (error) {
    logger.log('error adding target, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateTargetService = async (companyId, id, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await updateTargetByIdDao(conn, companyId, id, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating target, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getTotalRevenueByUserService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const team = await getAllEmployeesAssignedByManagerIdDao(
      conn,
      payload.id,
      payload.token
    );
    const user = team?.map((member) => member.id);
    const userId = `"${user.join('", "')}" , "${payload.id}"`;
    const monthlyData = await getTotalRevenueForMonthByIdDao(
      conn,
      payload,
      userId
    );
    const yearlyData = await getTotalRevenueForYearByIdDao(
      conn,
      payload,
      userId
    );
    const response = [];
    for (let i = 0; i < yearlyData.length; i++) {
      let found = false;
      for (let j = 0; j < monthlyData.length; j++) {
        if (yearlyData[i].target_user === monthlyData[j].target_user) {
          found = true;
          response.push({ ...yearlyData[i], ...monthlyData[j] });
          break;
        }
      }
      if (!found) {
        response.push(yearlyData[i]);
      }
    }
    const result = response.filter((obj) => obj.target_user === payload.id);
    let employeeTargetResult;
    const resultPromises = result.map(async (obj) => ({
      id: obj.id,
      first_name: obj.first_name,
      last_name: obj.last_name,
      target_user: obj.target_user,
      designation: obj.designation,
      childEmployee: await childEmployeeCountDao(
        conn,
        payload.token,
        obj.target_user
      ),
      total_yearly_targets: obj.total_yearly_targets ?? '0',
      total_yearly_revenue: obj.total_yearly_revenue ?? '0',
      total_monthly_targets: obj.total_monthly_targets ?? '0',
      total_monthly_revenue: obj.total_monthly_revenue ?? '0',
    }));
    employeeTargetResult = await Promise.all(resultPromises);
    if (employeeTargetResult.length === 0) {
      const users = await getUserByIdDao(
        conn,
        payload.token.companyId,
        payload.id
      );
      employeeTargetResult = [
        {
          id: null,
          first_name: users[0].first_name,
          last_name: users[0].last_name,
          designation: users[0].designation,
          target_user: payload.id,
          childEmployee: await childEmployeeCountDao(
            conn,
            payload.token,
            payload.id
          ),
          total_yearly_targets: '0',
          total_yearly_revenue: '0',
          total_monthly_targets: '0',
          total_monthly_revenue: '0',
        },
      ];
    }

    const subEmployee = response.filter(
      (obj) => obj.target_user !== payload.id
    );
    const subEmployeePromises = subEmployee.map(async (obj) => ({
      id: obj.id,
      first_name: obj.first_name,
      last_name: obj.last_name,
      target_user: obj.target_user,
      designation: obj.designation,
      childEmployee: await childEmployeeCountDao(
        conn,
        payload.token,
        obj.target_user
      ),
      total_yearly_targets: obj.total_yearly_targets ?? '0',
      total_yearly_revenue: obj.total_yearly_revenue ?? '0',
      total_monthly_targets: obj.total_monthly_targets ?? '0',
      total_monthly_revenue: obj.total_monthly_revenue ?? '0',
    }));
    const subEmployeeResults = await Promise.all(subEmployeePromises);
    const revenue = {
      id: employeeTargetResult[0].id,
      first_name: employeeTargetResult[0].first_name,
      last_name: employeeTargetResult[0].last_name,
      target_user: employeeTargetResult[0].target_user,
      designation: employeeTargetResult[0].designation,
      childEmployee: employeeTargetResult[0].childEmployee,
      total_yearly_targets: employeeTargetResult[0].total_yearly_targets,
      total_yearly_revenue: employeeTargetResult[0].total_yearly_revenue,
      total_monthly_targets: employeeTargetResult[0].total_monthly_targets,
      total_monthly_revenue: employeeTargetResult[0].total_monthly_revenue,
      subEmployeeResults,
    };

    return revenue;
  } catch (err) {
    logger.log('error while getting revenue by user Id', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getTargetListService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    const data = await getTargetListDao(conn, payload, offset);
    return data;
  } catch (err) {
    logger.log('error while getting target list', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getTargetHierarchyService = async (token, month, year, id) => {
  let conn;
  const target = [];
  try {
    conn = await db.fetchConn();

    const data = await getUsersByDesignationDao(conn, token.companyId, id);

    for (const iterator of data) {
      const dataList = await getAllEmployeesAssignedByManagerIdDao(
        conn,
        iterator.id,
        token
      );
      const obj = {
        id: iterator.id,
        employee: `${iterator.first_name} ${iterator.last_name}`,
        full_name: `${iterator.first_name} ${iterator.last_name}`,
        designation: iterator.designation,
        childEmployee: await childEmployeeCountDao(conn, token, iterator.id),
      };
      target.push(obj);

      if (dataList.length > 0) {
        for (const list of dataList) {
          const obj1 = {
            parent_id: iterator.id,
            childEmployee: await childEmployeeCountDao(conn, token, list.id),
            ...list,
          };
          target.push(obj1);
          const datachild = await getAllEmployeesAssignedByManagerIdDao(
            conn,
            list.id,
            token
          );

          if (datachild.length > 0) {
            for (const list02 of datachild) {
              const obj2 = {
                parent_id: list.id,
                childEmployee: childEmployeeCountDao(conn, token, list02.id),
                ...list02,
              };
              target.push(obj2);
              const datachild2 = await getAllEmployeesAssignedByManagerIdDao(
                conn,
                list02.id,
                token
              );
              if (datachild2.length > 0) {
                for (const subChild of datachild2) {
                  const obj3 = {
                    parent_id: list02.id,
                    childEmployee: await childEmployeeCountDao(
                      conn,
                      token,
                      subChild.id
                    ),
                    ...subChild,
                  };
                  target.push(obj3);
                }
              }
            }
          }
        }
      }
    }

    for (const item of target) {
      const dataa = await getTargetHierarchyDao(
        conn,
        token,
        month,
        year,
        item.id
      );

      if (dataa.length > 0) {
        const { monthly_target } = dataa[0];
        item.monthly_target = monthly_target;
      }
    }

    return target;
  } catch (err) {
    logger.log('error while getting target list', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const deleteTargetService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteTargetDao(conn, companyId, id);
    return data;
  } catch (err) {
    logger.log('error while deleting target', 'error', err);
  } finally {
    if (conn) conn.end();
  }
};
export {
  getTotalRevenueByCompanyService,
  addTargetService,
  updateTargetService,
  getTotalRevenueByUserService,
  getTargetListService,
  getTargetHierarchyService,
  deleteTargetService,
};
