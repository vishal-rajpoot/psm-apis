import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { getDesignationsDao } from '../../dao/designationDao';
import { VALIDATION_MESSAGES } from '../../utils/constants';
import { DuplicateDataError, BadRequestError } from '../../utils/appErrors';

import {
  getAllLeadsDao,
  getAllLeadsLimitDao,
  getLeadByIdDao,
  getLeadByContactNoDao,
  addLeadDao,
  updateLeadDao,
  deleteLeadDao,
  getEmployeeLeadsDao,
  transferLeadDao,
  updateTransferLeadNameDao,
  getLeadsByStatusDao,
  getLeadsByStatusLimitDao,
  multipleAddLeadDao,
  updateTransferLeadDao,
  rejectLeadDao,
  leadRecordDao,
  approveLeadDao,
  getEmployeeByLeadsIdDao,
} from '../../dao/leadsDao';

import {
  addUserDao,
  fetchEmployeeHierarchy,
  fetchDesignationRole,
  fetchVendorHierarchy,
  fetchRole,
} from '../../dao/userDao';
import { addInventoryDao } from '../../dao/inventoryDao';
import { getAllProductsForVendorDao } from '../../dao/productsDao';
import {
  getAllLeadActivitiesByLeadIdDao,
  addActivitiesDao,
  deleteLeadActivitiesDao,
} from '../../dao/leadActivitiesDao';
import {
  updateEmployeeVendorAssignmentDao,
  vendorByEmployeeIdDao,
  getHierarchyDetailByUserIdDao,
} from '../../dao/userManagementDao';

const logger = new Logger();

const getAllLeadsService = async (company, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined || payload.limit !== undefined) {
      data = await getAllLeadsLimitDao(conn, company, payload, offset);
    } else {
      data = await getAllLeadsDao(conn, company, payload);
    }
    return data;
  } catch (err) {
    logger.log('error while getting leads', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getLeadByIdService = async (req) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getLeadByIdDao(conn, req);
    return data;
  } catch (err) {
    logger.log('error while getting lead', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const addLeadService = async (req) => {
  let conn;
  const { companyId } = req.user;

  try {
    conn = await db.fetchConn();
    const checkLead = await getLeadByContactNoDao(
      conn,
      companyId,
      req.body.contact_no
    );
    if (checkLead !== undefined) {
      throw new DuplicateDataError(
        `Lead ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`
      );
    }
    await conn.beginTransaction();
    const data = await addLeadDao(conn, req);
    if (req.body.employee_id) {
      await transferLeadDao(conn, data.id, req.body, req.user);
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error adding lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const uploadLeadService = async (excelData, req) => {
  const { companyId } = req.user;
  const values = [];
  let conn;
  let data;
  const insertedLeads = [];
  try {
    conn = await db.fetchConn();
    if (
      excelData[0].first_name &&
      excelData[0].contact_no &&
      excelData[0].designation
    ) {
      const designationLead = await getDesignationsDao(conn, companyId);
      if (!designationLead) {
        throw new BadRequestError('designation does not exists');
      }

      const contacts = excelData.map((val) => val.contact_no);
      if (new Set(contacts).size !== contacts.length) {
        throw new DuplicateDataError(
          `Lead ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`
        );
      } else {
        for (const contact of contacts) {
          const results = await getLeadByContactNoDao(conn, companyId, contact);
          if (results) {
            throw new BadRequestError('Lead already exists');
          }
        }
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < excelData.length; i++) {
        const { first_name, last_name, contact_no, company, address } =
          excelData[i];
        const designations = designationLead.designation.filter(
          (desig) => desig.designation === excelData[i].designation
        );

        if (designations?.length > 0) {
          const timestamp = new Date().getTime();
          const config = {
            company,
            address,
            buyer_id: timestamp,
          };
          values.push({
            first_name,
            last_name,
            contact_no,
            designation: designations[0].id,
            companyId,
            config,
          });
        } else {
          throw new BadRequestError('Some Designations are not Exists');
        }
      }
      await conn.beginTransaction();
      for (const value of values) {
        data = await multipleAddLeadDao(conn, value, req);
        insertedLeads.push(data);
      }
      await conn.commit();
      return data;
    }

    throw new BadRequestError(
      'file does not contain proper data please select proper excel file'
    );
  } catch (error) {
    logger.log('error uploading lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateLeadService = async (req) => {
  let conn;
  const { companyId } = req.user;
  const { contact_no } = req.body;
  try {
    conn = await db.fetchConn();
    const checkLead = await getLeadByIdDao(conn, req);
    if (checkLead === undefined) {
      throw new BadRequestError('Lead does not exist');
    }
    const checkDuplicate = await getLeadByContactNoDao(
      conn,
      companyId,
      contact_no
    );
    if (
      checkDuplicate !== undefined &&
      checkDuplicate[0].id !== req.params.id
    ) {
      throw new DuplicateDataError(
        `Lead ${VALIDATION_MESSAGES.DUPLICATE_MOBILE}`
      );
    }
    await conn.beginTransaction();
    const data = await updateLeadDao(conn, req);
    if (req.body.employee_id) {
      await updateTransferLeadDao(
        conn,
        req.params.id,
        req.body.employee_id,
        req.user
      );
    }
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error updating lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteLeadService = async (req) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkLead = await getLeadByIdDao(conn, req);
    if (checkLead === undefined) {
      throw new BadRequestError('Lead does not exist');
    }
    await conn.beginTransaction();
    const data = await deleteLeadDao(conn, req);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error deleting lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getEmployeeLeadsService = async (user, companyId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getEmployeeLeadsDao(conn, user, companyId);
    return data;
  } catch (err) {
    logger.log('error while getting employee leads', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const transferLeadService = async (id, payload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await transferLeadDao(conn, id, payload, token);
    await updateTransferLeadNameDao(conn, id, payload, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error transferring lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updatetransferLeadService = async (payload, token) => {
  let conn;
  const { employee_id } = payload;
  const { lead_id } = payload;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();

    for (const lead of lead_id) {
      data = await updateTransferLeadDao(conn, lead, employee_id, token);
    }

    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error transferring lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getLeadsByStatusService = async (
  company,
  payload,
  userId,
  designationId,
  role
) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    let status = false;
    const checkDesignation = await fetchDesignationRole(
      conn,
      company,
      designationId
    );
    let lowerLevelId = [];
    if (checkDesignation && checkDesignation.designation === 'admin') {
      status = true;
    } else {
      const rolesforlist = await fetchRole(conn, company, role);
      if (rolesforlist && rolesforlist.role === 'employee') {
        lowerLevelId = await fetchEmployeeHierarchy(conn, userId, company);
      } else {
        lowerLevelId = await fetchVendorHierarchy(conn, userId, company);
      }
    }
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    if (payload.page !== undefined && payload.limit !== undefined) {
      data = await getLeadsByStatusLimitDao(
        conn,
        company,
        payload,
        offset,
        status,
        lowerLevelId
      );
    } else {
      data = await getLeadsByStatusDao(
        conn,
        company,
        payload,
        status,
        lowerLevelId
      );
    }
    return data;
  } catch (err) {
    logger.log('error while getting leads', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const rejectLeadService = async (id, payload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await rejectLeadDao(conn, id, payload, token);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error rejecting lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const approveLeadService = async (id, token, role_id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const record = await leadRecordDao(conn, id, token);
    const payload = {
      first_name: record[0]?.first_name,
      last_name: record[0]?.last_name,
      email: record[0]?.email,
      contact_no: record[0]?.contact_no,
      designation_id: record[0]?.designation,
      config: record[0]?.config,
      role_id,
    };
    await conn.beginTransaction();
    await approveLeadDao(conn, id, token);
    const data = await addUserDao(conn, token, payload);

    const getleadActivity = await getAllLeadActivitiesByLeadIdDao(
      conn,
      id,
      token
    );

    const getemployee = await getEmployeeByLeadsIdDao(conn, id, token);

    if (data !== undefined) {
      const userId = getemployee.user;
      const { companyId } = token;
      if (getleadActivity !== undefined) {
        for (const item of getleadActivity) {
          item.config.buyer_id = data.id;
          if (item.event_type === 'lead_order') {
            await addActivitiesDao(
              conn,
              userId,
              companyId,
              item.config,
              'order'
            );
          }
          if (item.event_type === 'lead_reminder') {
            await addActivitiesDao(
              conn,
              userId,
              companyId,
              item.config,
              'reminder'
            );
          }
          if (item.event_type === 'lead_discussion') {
            await addActivitiesDao(
              conn,
              userId,
              companyId,
              item.config,
              'discussion'
            );
          }

          await deleteLeadActivitiesDao(conn, item.activity_id, token);
        }
      }
      if (getemployee !== undefined) {
        const newToken = {
          token: {
            userId: getemployee.user,
            companyId: token.companyId,
          },
        };
        const newVendor = data.id;

        const vendors = await vendorByEmployeeIdDao(conn, newToken);
        const updatedVendors = [];
        let found = false;
        for (const item of vendors.vendors) {
          if (item.designation_id === payload.designation_id) {
            item.vendors.push(newVendor);
            found = true;
          }
        }

        if (!found) {
          const newObj = {
            designation_id: payload.designation_id,
            vendors: [newVendor],
          };

          updatedVendors.push(newObj);
        }

        const allHierarchy = await getHierarchyDetailByUserIdDao(
          conn,
          getemployee.user,
          token
        );

        allHierarchy[0].config.vendor = updatedVendors;

        await updateEmployeeVendorAssignmentDao(
          conn,
          getemployee.user,
          allHierarchy[0],
          token
        );
      }
    }

    const getAllProducts = await getAllProductsForVendorDao(conn, token);
    const newData = getAllProducts.map((obj) => ({ ...obj, quantity: 0 }));
    const vendorStocks = {
      vendor_id: data.id,
      config: newData,
    };

    await addInventoryDao(conn, token, vendorStocks);

    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error approving lead, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllLeadsService,
  getLeadByIdService,
  addLeadService,
  updateLeadService,
  deleteLeadService,
  getEmployeeLeadsService,
  transferLeadService,
  updatetransferLeadService,
  getLeadsByStatusService,
  uploadLeadService,
  rejectLeadService,
  approveLeadService,
};
