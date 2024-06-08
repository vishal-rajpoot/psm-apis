/* eslint-disable no-param-reassign */
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { getRoleByIdDao, getAllRolesDao } from '../../dao/rolesDao';
import { getDesignationsDao } from '../../dao/designationDao';
import {
  addUserAssignmentsDao,
  updateEmployeeVendorAssignmentDao,
  getHierarchyDetailByUserIdDao,
  deleteUserManagementDao,
  getAllVendorsDao,
  updateHierarchyDao,
} from '../../dao/userManagementDao';
import { addInitialTargetDao } from '../../dao/targetDao';
import {
  ROLE_TYPE,
  VALIDATION_MESSAGES,
  NOT_FOUND_MESSAGE,
  designation,
  START_DAY,
} from '../../utils/constants';
import {
  getUsersDao,
  getUsersLimitDao,
  getUsersRegionWiseDao,
  getUserByIdDao,
  getUsersByDesignationDao,
  addUserDao,
  updateUserDao,
  deleteUserDao,
  getUsersByContactNoDao,
  updateUserDesignationDao,
  getUserIdByNameDao,
  getAllEmployeeTodayAttendanceDao,
  updatePasswordDao,
  getUserPasswordByIdDao,
  getDeletedUsersDao,
  getActiveOrInactiveUsersDao,
  addSignupUserDao,
  checkMobilenumberForSignup,
  getDeletedUsersByDesignationDao,
  assignDeleteUserDao,
  assigneRoleDao,
  registeredUserDao,
  statusChangetByIdDao,
  getRmWiseregisteredUserDao,
  getStateFromUserId,
  addDeleteStatus,
  fetchEmployeeHierarchy,
  fetchDesignationRole,
  fetchVendorHierarchy,
  fetchRole,
  getEmloyeeDao,
  addEmployeeService,
  addSignupMdaDao,
} from '../../dao/userDao';
import { addNewEmployeeToProductToEmployeeDao } from '../../dao/employeeProductDao';
import {
  getAllProductsDao,
  getAllProductsForVendorDao,
} from '../../dao/productsDao';
import { hashValue } from '../../utils/auth';
import {
  DuplicateDataError,
  NotFoundError,
  BadRequestError,
} from '../../utils/appErrors';
import {
  deleteLeadsEmployeeAssignment,
  getLeadsNewAndPending,
  updateEmployee,
} from '../../dao/leadsDao';
import { addInventoryDao } from '../../dao/inventoryDao';
import { uploadToAWS } from '../../utils/aws';

const logger = new Logger();

const getUsersService = async (
  companyId,
  role,
  region,
  payload,
  designation,
  designationId,
  userId
) => {
  let conn;
  let data;
  const date = new Date().toISOString().slice(0, 10);
  region = `${region}`;
  try {
    conn = await db.fetchConn();
    let status = false;
    const checkDesignation = await fetchDesignationRole(
      conn,
      companyId,
      designationId
    );
    let lowerLevelId = [];
    if (checkDesignation && checkDesignation.designation === 'admin') {
      status = true;
    } else {
      const rolesforlist = await fetchRole(conn, companyId, role);
      if (rolesforlist && rolesforlist.role === 'employee') {
        lowerLevelId = await fetchEmployeeHierarchy(conn, userId, companyId);
      } else {
        lowerLevelId = await fetchVendorHierarchy(conn, userId, companyId);
      }
    }
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (region !== 'undefined') {
      data = await getUsersRegionWiseDao(
        conn,
        companyId,
        role,
        region,
        designation
      );
    } else if (payload.deleted) {
      data = await getDeletedUsersDao(
        conn,
        companyId,
        role,
        payload,
        designation,
        status,
        lowerLevelId
      );
    } else {
      if (payload.page !== undefined && payload.limit !== undefined) {
        data = await getUsersLimitDao(
          conn,
          companyId,
          role,
          payload,
          offset,
          designation
        );
      } else if (payload.status) {
        data = await getActiveOrInactiveUsersDao(
          conn,
          companyId,
          role,
          payload,
          designation,
          status,
          lowerLevelId
        );
      } else {
        data = await getUsersDao(
          conn,
          companyId,
          role,
          designation,
          status,
          lowerLevelId
        );
      }
      const getroledata = await getRoleByIdDao(conn, companyId, role);
      const roleName = getroledata[0].role;
      const user = [];
      if (roleName === 'employee' && data) {
        for (const item of data.user) {
          const payloadData = {
            event_type: START_DAY,
            id: item.id,
            companyId,
            date,
          };
          const getAttendance = await getAllEmployeeTodayAttendanceDao(
            conn,
            payloadData
          );
          const newObject = { ...item };
          newObject.attendance = getAttendance;
          user.push(newObject);
        }
        if (data?.totalRowsValue) {
          const { totalRowsValue } = data;
          return { totalRowsValue, user };
        }
        return { user };
      }
    }
    return data;
  } catch (error) {
    logger.log('error while getting Users', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const getEmployeeService = async (companyId, roleId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getEmloyeeDao(conn, companyId, roleId);
    return data;
  } catch (error) {
    logger.log('error while getting Employee', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const registeredUserService = async (
  companyId,
  status,
  designation_name,
  userId
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    let data;
    if (designation_name === 'admin') {
      data = await registeredUserDao(conn, companyId, status);
    } else if (designation_name === 'RM') {
      const state = await getStateFromUserId(conn, userId);
      data = await getRmWiseregisteredUserDao(conn, companyId, status, state);
    } else {
      return undefined;
    }
    return data;
  } catch (error) {
    logger.log('error while Registered User', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const statusChangetByIdService = async (companyId, id, status, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await statusChangetByIdDao(
      conn,
      companyId,
      id,
      status,
      payload
    );
    return data;
  } catch (error) {
    logger.log(`error while getting User  by ${id} id`, 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const getUserByIdService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getUserByIdDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log(`error while getting User  by ${id} id`, 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getUsersByDesignationService = async (companyId, designationId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getUsersByDesignationDao(conn, companyId, designationId);
    return data;
  } catch (error) {
    logger.log('error while getting Users by Designation', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const assigneDeleteUserService = async (token, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const role = await assigneRoleDao(conn, payload);
    const data = await assignDeleteUserDao(conn, token, payload);
    const addAssignStatus = await addDeleteStatus(conn, payload);
    return data;
  } catch (error) {
    logger.log(
      `error while getting User  by ${token.userId} id`,
      'error',
      error
    );
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const getDeletedUsersByDesignationService = async (
  companyId,
  deletedesignationId
) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getDeletedUsersByDesignationDao(
      conn,
      companyId,
      deletedesignationId
    );
    return data;
  } catch (error) {
    logger.log('error while getting Users by Designation', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateUserService = async (id, newPayload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();

    const data = await updateUserDao(conn, id, newPayload, token);
    if (newPayload.config.hierarchy && newPayload.role === ROLE_TYPE.EMPLOYEE) {
      const checkUserHierarchy = await getHierarchyDetailByUserIdDao(
        conn,
        id,
        token
      );
      const hierarchy_obj = {
        employeeId: id,
        config: newPayload.config.hierarchy,
      };
      if (!checkUserHierarchy[0] || checkUserHierarchy[0].user !== id) {
        await addUserAssignmentsDao(conn, hierarchy_obj, token);
      } else {
        await updateEmployeeVendorAssignmentDao(conn, id, hierarchy_obj, token);
      }
    }
    if (newPayload.config.hierarchy && newPayload.role === ROLE_TYPE.VENDOR) {
      const checkUserHierarchy = await getHierarchyDetailByUserIdDao(
        conn,
        id,
        token
      );
      const hierarchy_obj = {
        employeeId: id,
        config: newPayload.config.hierarchy,
      };
      if (!checkUserHierarchy[0] || checkUserHierarchy[0].user !== id) {
        await addUserAssignmentsDao(conn, hierarchy_obj, token);
      } else {
        await updateEmployeeVendorAssignmentDao(conn, id, hierarchy_obj, token);
      }
    }
    return data;
  } catch (error) {
    logger.log('error while updating User', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const processUser = async (conn, token, userPayload) => {
  const checkUser = await getUsersByContactNoDao(conn, token, userPayload);
  if (checkUser !== undefined) {
    throw new DuplicateDataError(
      `User ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`
    );
  }

  const newUserPayload = {
    ...userPayload,
  };

  newUserPayload.config.flag = 0;
  const userData = await addUserDao(conn, token, newUserPayload);
  if (userPayload.config.hierarchy) {
    const hierarchy_obj = {
      employeeId: userData.id,
      config: userPayload.config.hierarchy,
    };
    await addUserAssignmentsDao(conn, hierarchy_obj, token);
  }
  if (userPayload.role === ROLE_TYPE.EMPLOYEE) {
    const Token = {
      token,
    };
    const getproduct = await getAllProductsDao(conn, Token);
    const arr = [];
    if (getproduct) {
      for (const item of getproduct.products) {
        arr.push(item.id);
      }
    }
    const empProductObj = {
      employee: userData.id,
      config: { product_ids: arr },
      token,
    };

    await addNewEmployeeToProductToEmployeeDao(conn, empProductObj);

    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    const targetObject = {
      payload: {
        source_user: token.userId,
        target_user: userData.id,
        target_amount: 0,
        month,
        year,
      },
      token,
    };
    await addInitialTargetDao(conn, targetObject);
  }
  if (userPayload.role === ROLE_TYPE.VENDOR) {
    const getAllProducts = await getAllProductsForVendorDao(conn, token);

    const newData = getAllProducts.map((obj) => ({ ...obj, quantity: 0 }));
    const vendorStocks = {
      vendor_id: userData.id,
      config: newData,
    };

    await addInventoryDao(conn, token, vendorStocks);
  }

  await conn.commit();
  return userData;
};

const addUserService = async (token, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    if (Array.isArray(payload)) {
      for (const user of payload) {
        data = await processUser(conn, token, user);
      }
    } else {
      data = await processUser(conn, token, payload);
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding User', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const uploadCustomerService = async (token, excelData) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const roles = await getAllRolesDao(conn, token);
    const designationsData = await getDesignationsDao(conn, token.companyId);
    const designations = designationsData.designation;
    let checkUser;
    const customerDesignation = designations.find(
      (designation) => designation.designation.trim() === 'customer'
    );
    const customerId = customerDesignation ? customerDesignation.id : null;
    const roleId = roles.find((role) => role.role === 'vendor')?.id;
    const usersToAdd = [];
    for (const e of excelData) {
      const {
        created_on,
        zonal_manager,
        area_manager,
        sales_officer,
        mil_custcode,
        code,
        name,
        street,
        street_2,
        street_3,
        city,
        postal_code,
        district,
        region,
        term_of_payment,
        gst_no,
        pan_no,
        telephone,
        contact_no,
        email,
        remarks,
        bank_name,
        proprietor_name,
        creditLimit,
        cust_block_for_sales_area_for_sor,
        salesperson_contact,
      } = e;
      const validationErrors = [];
      const [first_name, last_name] = e.proprietor_name.split(' ');

      if (contact_no) {
        checkUser = await getUsersByContactNoDao(conn, token, e);
      }
      const cleaned_street = street.replace("'", '');
      const cleaned_street_2 = street_2.replace("'", '');
      const cleaned_street_3 = street_3.replace("'", '');
      const company = name.replace(/'/g, '');
      if (checkUser === undefined && email) {
        const user_object = {
          first_name,
          last_name,
          email,
          contact_no,
          role_id: roleId,
          designation_id: customerId,
          config: {
            created_on,
            zonal_manager,
            area_manager,
            sales_officer,
            mil_custcode,
            code,
            company,
            street: cleaned_street,
            street_2: cleaned_street_2,
            street_3: cleaned_street_3,
            city,
            postal_code,
            district,
            region,
            term_of_payment,
            gst_no,
            pan_no,
            telephone,
            remarks,
            bank_name,
            creditLimit,
            cust_block_for_sales_area_for_sor,
            salesperson_contact,
          },
        };
        usersToAdd.push(user_object);
      }
    }
    const added_users = [];
    for (const user of usersToAdd) {
      const add_user = await addUserService(token, user);
      added_users.push(add_user);
    }
    return added_users;
  } catch (error) {
    logger.log('error while adding User', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const uploadUserService = async (token, excelData) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const roles = await getAllRolesDao(conn, token);
    const designations = await getDesignationsDao(conn, token.companyId);

    const designationIdByName = designations.designation.reduce(
      (acc, designation) => {
        acc[designation.designation] = designation.id;
        return acc;
      },
      {}
    );
    const user_data = await getUserIdByNameDao(conn, token);
    const userIdByName = user_data.reduce((acc, user) => {
      acc[user.name] = user.id;
      return acc;
    }, {});
    if (roles === undefined || designations === undefined) {
      throw new NotFoundError(`Role or Designation ${NOT_FOUND_MESSAGE}`);
    }

    const allValidationErrors = [];
    const usersToAdd = [];
    for (const e of excelData) {
      const {
        first_name,
        last_name,
        contact_no,
        email,
        role,
        designation,
        birth_date,
        landline_number,
        state,
        city,
        country,
        pincode,
        GSTN,
        address,
        password,
        confirm_password,
        bank_name,
        IFSC_code,
        hierarchy,
        company,
        region,
        employee_code,
        location,
      } = e;
      const validationErrors = [];
      if (
        !first_name ||
        !last_name ||
        !contact_no ||
        !email ||
        !role ||
        !designation ||
        !password
      ) {
        validationErrors.push(`data ${NOT_FOUND_MESSAGE}`);
      }
      const checkUser = await getUsersByContactNoDao(conn, token, e);
      if (checkUser !== undefined) {
        validationErrors.push(`User ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`);
      }

      const roleData = roles.filter((desig) => desig.role === role);

      const designationId = designationIdByName[designation];

      if (!designationId) {
        validationErrors.push(`Designation ${NOT_FOUND_MESSAGE}`);
      }

      const hierarchyNames = hierarchy?.split(',').map((name) => name.trim());
      const hierarchyUserIds = hierarchyNames?.map((name) => {
        const userId = userIdByName[name];
        if (!userId) {
          validationErrors.push(`User ${name} ${NOT_FOUND_MESSAGE}`);
        }

        return userId;
      });

      if (roleData.length <= 0) {
        validationErrors.push(`role ${NOT_FOUND_MESSAGE}`);
      }
      if (password !== confirm_password) {
        validationErrors.push('Passwords do not match');
      }
      if (validationErrors.length > 0) {
        allValidationErrors.push(validationErrors);
      } else {
        let hierarchy_obj = {
          parent: [],
          child: hierarchyUserIds || [],
          vendor: [],
        };
        if (role === ROLE_TYPE.EMPLOYEE) {
          hierarchy_obj = {
            parent: [],
            child: [],
            vendor: hierarchyUserIds || [],
          };
        }
        const user_object = {
          first_name,
          last_name,
          email,
          contact_no,
          password,
          role_id: roleData[0].id,
          designation_id: designationId,
          role,
          config: {
            birth_date,
            landline_number,
            state,
            city,
            country,
            pincode,
            GSTN,
            address,
            bank_name,
            IFSC_code,
            hierarchy: hierarchy_obj,
            company,
            region,
            employee_code,
            location,
          },
        };
        usersToAdd.push(user_object);
      }
    }
    if (allValidationErrors.length > 0) {
      throw new BadRequestError(allValidationErrors[0][0]);
    }
    const added_users = [];
    for (const user of usersToAdd) {
      const add_user = await addUserService(token, user);
      added_users.push(add_user);
    }
    return added_users;
  } catch (error) {
    logger.log('error while adding User', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const uploadEmployeeService = async (token, excelData) => {
  let conn;
  try {
    conn = await db.fetchConn();
    let employeeRoleId;
    const usersToAdd = [];
    const allValidationErrors = [];
    const roles = await getAllRolesDao(conn, token);
    roles.forEach((role) => {
      if (role.role === 'employee') {
        employeeRoleId = role.id;
      }
    });
    const designations = await getDesignationsDao(conn, token.companyId);

    const designationIdByName = designations.designation.reduce(
      (acc, designation) => {
        acc[designation.designation] = designation.id;
        return acc;
      },
      {}
    );
    for (const e of excelData) {
      const { Emp_Code, Emp_Name, Designation, Location, contact_no } = e;
      const checkUser = await getUsersByContactNoDao(conn, token, e);
      const validationErrors = [];
      if (checkUser !== undefined) {
        validationErrors.push(`User ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`);
      }
      if (validationErrors.length > 0) {
        allValidationErrors.push(validationErrors);
      } else {
        const designationId = designationIdByName[e.Designation];
        const [firstName, lastName] = e.Emp_Name.split(' ');
        if (!designationId) {
          validationErrors.push(`Designation "${e.Designation}" not found`);
        } else {
          const user_object = {
            first_name: firstName,
            last_name: lastName,
            contact_no,
            role: employeeRoleId,
            designation: designationId,
            config: {
              Emp_Code,
              Location,
            },
          };
          usersToAdd.push(user_object);
        }
      }
    }
    if (allValidationErrors.length > 0) {
      throw new BadRequestError(allValidationErrors[0][0]);
    }
    const added_users = [];
    for (const user of usersToAdd) {
      const add_user = await addEmployeeService(conn, token, user);
      added_users.push(add_user);
    }
    return added_users;
  } catch (error) {
    logger.log('error while adding User', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const signupMdaService = async (images, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const checkUser = await checkMobilenumberForSignup(conn, payload);
    if (checkUser !== undefined) {
      throw new DuplicateDataError(
        `User ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`
      );
    } else {
      const aadAdharCardFront = await uploadToAWS(images?.aadhar_card_front[0]);
      const aadAdharCardBack = await uploadToAWS(images?.aadhar_card_back[0]);
      const cv = await uploadToAWS(images?.cv[0]);
      const panCard = await uploadToAWS(images?.pan_card[0]);
      const bankDetail = await uploadToAWS(images?.bank_detail[0]);
      const files = {
        aadAdharCardFront_fileName: aadAdharCardFront?.imageUrl,
        aadAdharCardBack_fileName: aadAdharCardBack?.imageUrl,
        cv_image_fileName: cv?.imageUrl,
        panCard_image_fileName: panCard?.imageUrl,
        bankDetail_image_fileName: bankDetail?.imageUrl,
      };
      payload.config.document.push(files);
      const newUserPayload = {
        ...payload,
      };
      data = await addSignupMdaDao(conn, newUserPayload);
      if (data !== undefined) {
        const url = `http://login.aquasms.com/sendSMS?username=bhavik15vora@gmail.com&message=Your
        Your registration is successful! Click the link below to login to your account:
        https://play.google.com/store/search?q=meghmani&c=apps
         &sendername=ASKGSN&smstype=TRANS&numbers=+91${payload.contact_no}&apikey=753b97b5-bd05-4077-9c91-84149e6b15eb`;
        try {
          const response = await fetch(url);
          logger.log('Message send  on mobile No', 'info', response);
        } catch (err) {
          throw new BadRequestError(err.code);
        }
      }
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding User', 'error', error);
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const signupUserService = async (payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const checkUser = await checkMobilenumberForSignup(conn, payload);
    if (checkUser !== undefined) {
      throw new DuplicateDataError(
        `User ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`
      );
    } else {
      // const { password } = payload;
      // const hashedPassword =
      //   password !== undefined ? hashValue(password) : null;
      const newUserPayload = {
        ...payload,
        // password: hashedPassword,
      };
      data = await addSignupUserDao(conn, newUserPayload);
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding User', 'error', error);
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteUserService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const user = await getUserByIdDao(conn, companyId, id);
    const data = await deleteUserDao(conn, companyId, id);
    if (user[0].role === ROLE_TYPE.EMPLOYEE) {
      await deleteUserManagementDao(conn, companyId, id);
      const leadStatus = await getLeadsNewAndPending(conn, companyId, id);
      for (const lead of leadStatus) {
        if (user[0].id === lead.employee_id) {
          const payload = lead.config;
          const newConfig = {
            ...payload,
            employee: '',
          };
          await updateEmployee(conn, lead.id, companyId, newConfig);
          await deleteLeadsEmployeeAssignment(
            conn,
            lead.id,
            lead.employee_id,
            companyId
          );
        }
      }
    } else if (user[0].role === ROLE_TYPE.VENDOR) {
      const vendors = await getAllVendorsDao(conn, companyId);

      for (const vendor of vendors) {
        if (vendor.vendor_id === id) {
          const updatedVendors = vendor.vendors.filter(
            (vendorId) => vendorId !== id
          );
          await updateHierarchyDao(
            conn,
            companyId,
            vendor.user_hierarchy_id,
            updatedVendors
          );
        }
      }
    }
    return data;
  } catch (error) {
    logger.log('error while deleting User', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateUserDesignationService = async (token, id, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await updateUserDesignationDao(conn, token, id, payload);
    return data;
  } catch (error) {
    logger.log('error while updating User designation', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateUserPasswordService = async (id, companyId, payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const getUser = await getUserPasswordByIdDao(conn, companyId, id);
    if (!getUser) {
      throw new BadRequestError('User not Exist');
    }
    const isPasswordValid = bcrypt.compareSync(
      payload.oldPassword,
      getUser[0].password
    );
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid password');
    }
    const hashedPassword = hashValue(payload.newPassword);
    const data = await updatePasswordDao(conn, id, companyId, hashedPassword);
    return data;
  } catch (error) {
    logger.log('error while updating User password', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getUsersService,
  getUserByIdService,
  getUsersByDesignationService,
  updateUserService,
  getDeletedUsersByDesignationService,
  signupUserService,
  processUser,
  addUserService,
  deleteUserService,
  uploadUserService,
  updateUserDesignationService,
  updateUserPasswordService,
  assigneDeleteUserService,
  registeredUserService,
  statusChangetByIdService,
  getEmployeeService,
  uploadEmployeeService,
  uploadCustomerService,
  signupMdaService,
};
