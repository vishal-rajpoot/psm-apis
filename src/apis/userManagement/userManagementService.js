import { role_name } from '../../utils/constants';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getAllUnassignedUsersDao,
  getVendorsWithDesignationAssignedByManagerIdDao,
  addUserAssignmentsDao,
  updateEmployeeVendorAssignmentDao,
  employeeByVendorIdDao,
  getVendorsInChildDao,
  getAllUsersHierarchyByCompany,
} from '../../dao/userManagementDao';
import { getUserByIdDao, updateUserDao } from '../../dao/userDao';
import { BadRequestError } from '../../utils/appErrors';
import { getRoleByNameDao } from '../../dao/rolesDao';

const logger = new Logger();

const getAllUnassignedUsersService = async (
  token,
  child_designation_id, // child/vendors designation id which are assigned to user
  userId,
  roleName,
  child
) => {
  let conn;
  let allInsideUsers;
  const users = [];
  const filteredUsers = [];
  try {
    conn = await db.fetchConn();

    if (!child_designation_id) {
      throw BadRequestError('vendor id is missing');
    }
    if (!roleName) {
      throw new BadRequestError('role is missing');
    }
    const role = await getRoleByNameDao(conn, token, roleName);

    const data = await getAllUnassignedUsersDao(
      conn,
      token,
      child_designation_id
    );
    for (const user of data) {
      let isMatch = false;
      // if (!userId) {
      //   users.push(user);
      // } else {
      const allUsersHierarchy = await getAllUsersHierarchyByCompany(
        conn,
        token
      );
      for (const allUsers of allUsersHierarchy) {
        if (!child && role.role === role_name.employee) {
          allInsideUsers =
            await getVendorsWithDesignationAssignedByManagerIdDao(
              conn,
              allUsers.user_id,
              token
            );
        }

        if (child && role.role === role_name.employee) {
          allInsideUsers = await getVendorsInChildDao(
            conn,
            allUsers.user_id,
            token
          );
          // console.log('secooooo')
        }

        if (role.role === role_name.vendor) {
          allInsideUsers = await getVendorsInChildDao(
            conn,
            allUsers.user_id,
            token
          );
        }
        const allVendors = allInsideUsers[0]?.vendors;
        // console.log(allVendors, 'alluuuuu')

        for (const filterUser of allVendors) {
          filteredUsers.push(filterUser);
        }
      }

      if (filteredUsers.length < 1) {
        users.push(user);
      } else {
        for (const outVendors of filteredUsers) {
          const childUsers = outVendors?.vendors ?? outVendors?.employees;

          for (const insideVendors of childUsers) {
            // console.log(insideVendors, user.id, '--=000000');
            if (insideVendors === user.id) {
              isMatch = true;
              break;
            }
          }
          if (isMatch) {
            break;
          }
        }
        if (!isMatch) {
          users.push(user);
        }
      }
      // }
      // }
    }
    const uniqueArray = users.reduce((accumulator, currentValue) => {
      const existingObject = accumulator.find(
        (obj) => obj.id === currentValue.id
      );
      if (!existingObject) {
        accumulator.push(currentValue);
      }
      return accumulator;
    }, []);
    return uniqueArray;
  } catch (err) {
    logger.log('error while getting unassigned users', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getAllEmployeesAssignedByManagerIdService = async (id, token) => {
  let conn;
  const users = [];
  try {
    conn = await db.fetchConn();
    const data = await getVendorsInChildDao(conn, id, token);
    console.log(data[0]);

    const allEmployees = data[0]?.vendors;
    if (!allEmployees[0]) {
      return users;
    }
    console.log(allEmployees);
    for (const employee of allEmployees) {
      for (const employee_id of employee.employees) {
        const user = await getUserByIdDao(conn, token.companyId, employee_id);
        users.push(user[0]);
      }
    }
    return users;
  } catch (err) {
    logger.log('error while getting employee assignement', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getAllVendorsAssignedByManagerIdService = async (
  id,
  token,
  designation_id,
  roleName
) => {
  let conn;
  const users = [];
  let data;
  try {
    conn = await db.fetchConn();
    if (!roleName) {
      throw new BadRequestError('role is missing');
    }
    const role = await getRoleByNameDao(conn, token, roleName);
    if (role.role === role_name.employee) {
      data = await getVendorsWithDesignationAssignedByManagerIdDao(
        conn,
        id,
        token,
        designation_id
      );
    } else if (role.role === role_name.vendor) {
      data = await getVendorsInChildDao(conn, id, token, designation_id);
    }
    if (!data[0]) {
      throw new BadRequestError('designations not found');
    }
    const { vendors } = data[0];

    for (const vendor of vendors) {
      if (!designation_id) {
        throw new BadRequestError('designation id is missing');
      }
      if (vendor.designation_id === designation_id) {
        for (const insideVendor of vendor.vendors) {
          const user = await getUserByIdDao(
            conn,
            token.companyId,
            insideVendor
          );
          if (!user) {
            throw new BadRequestError('vendors not found');
          }
          users.push(user[0]);
        }
      }
    }
    return users;
  } catch (err) {
    logger.log('error while getting vendor assignment', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addUserAssignmentService = async (payload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await addUserAssignmentsDao(conn, payload, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error adding user assigments, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateUserAssignmentService = async (id, config, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const payload = {
      config,
    };
    const data = await updateEmployeeVendorAssignmentDao(
      conn,
      id,
      payload,
      token
    );
    // eslint-disable-next-line prefer-const
    let user = await getUserByIdDao(conn, token.companyId, id);
    user[0].config.hierarchy = config;
    await updateUserDao(conn, id, user[0], token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error updating user assignment, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateEmployeeVendorAssignmentService = async (id, payload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await updateEmployeeVendorAssignmentDao(
      conn,
      id,
      payload,
      token
    );
    await conn.commit();
    return data;
  } catch (error) {
    logger.log(
      'error updating employee vendor assignment, reverting changes',
      'error',
      error
    );
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getEmployeesByVendorIdService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await employeeByVendorIdDao(conn, payload);
    return data;
  } catch (err) {
    logger.log('error while getting employee by vendor id', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllUnassignedUsersService,
  getAllEmployeesAssignedByManagerIdService,
  getAllVendorsAssignedByManagerIdService,
  addUserAssignmentService,
  updateUserAssignmentService,
  updateEmployeeVendorAssignmentService,
  getEmployeesByVendorIdService,
};
