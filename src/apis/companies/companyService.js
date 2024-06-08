/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-else-return */
import sgMail from '@sendgrid/mail';
import { addRoleDao } from '../../dao/rolesDao';
import { addDesignationDao } from '../../dao/designationDao';
import {
  addCompanyDao,
  getCompaniesDao,
  getCompany,
  getCompanyByMobile,
  getLabelingDao,
  getTerritoriesDao,
  getnegativeStockDao,
  updateCompany,
  updateNegativeStockDao,
  getConfigDao,
} from '../../dao/companyDao';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { processUser } from '../users/userService';
import { role_name } from '../../utils/constants';
import generatePassword from '../../utils/generateRandomPassword';
import { BadRequestError, AuthenticationError } from '../../utils/appErrors';
import appconfig from '../../config/appconfig';
import * as authUtils from '../../utils/auth';

const logger = new Logger();
const logoutSet = new Set();

const getCompaniesService = async () => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getCompaniesDao(conn);
    return data;
  } catch (err) {
    logger.log('error while getting companies', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getTerritoriesService = async (companyId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getTerritoriesDao(conn, companyId);
    return data;
  } catch (err) {
    logger.log('error while getting territories', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};
const getConfigService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getConfigDao(conn, payload);
    return data;
  } catch (err) {
    logger.log('error while getting Data', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getnegativeStockService = async (companyId) => {
  let conn;

  try {
    conn = await db.fetchConn();
    const data = await getnegativeStockDao(conn, companyId);
    return data;
  } catch (error) {
    logger.log('error while getting negative Stock', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getLabelingService = async (companyId) => {
  let conn;

  try {
    conn = await db.fetchConn();
    const data = await getLabelingDao(conn, companyId);
    return data;
  } catch (error) {
    logger.log('error while getting labels', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addCompanyService = async (payload) => {
  let conn;
  let data;

  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const allCompanies = await getCompaniesDao(conn);
    if (
      allCompanies?.some((company) => company.contact_no === payload.contact_no)
    ) {
      throw new BadRequestError('Company Already Exists With Same Mobile No');
    }
    if (
      allCompanies?.some(
        (company) => company.company_name === payload.company_name
      )
    ) {
      throw new BadRequestError('Company Already Exists With Same Name');
    }

    const tokenInfo = authUtils.createNewToken({
      username: payload.contact_no,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      state: payload.state,
    });

    const newPayload = {
      ...payload,
      config: tokenInfo.accessToken,
    };
    data = await addCompanyDao(conn, newPayload);
    if (!data) {
      throw new BadRequestError('company not added');
    }

    sgMail.setApiKey(appconfig.SENDGRID_API_KEY);
    const msg = {
      to: payload.email,
      from: 'milan@nstacksoftech.com',
      subject: 'Verify Your Email Address',
      text: 'Please click on the Activation link below to verify your email.',
      html: `<p>Please click on the Activation link to verify your email: <a href="http://psm.nstacksoftech.com/auth/verifyEmail/${tokenInfo.accessToken}">http://psm.nstacksoftech.com/auth/verifyEmail/${tokenInfo.accessToken}</a></p>`,
    };
    try {
      await sgMail.send(msg);
      logger.log('Activation link sent. Please verify your email', 'info');
    } catch (error) {
      logger.log(
        'Error while sending Activation link to email',
        'error',
        error
      );
    }

    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding company', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const companyVerificationService = async (token) => {
  let conn;
  let verifyDetails;
  let rolePayload;

  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    if (logoutSet.has(token)) {
      throw new AuthenticationError('Token expired');
    }
    try {
      const decoded = await authUtils.verifyToken(
        token,
        appconfig.auth.jwt_secret
      );

      verifyDetails = decoded;
    } catch (error) {
      // company should be deleted
      throw new AuthenticationError('Invalid token');
    }
    const companyDetails = await getCompanyByMobile(
      conn,
      verifyDetails?.username
    );
    const companyId = companyDetails[0]?.id;

    const newToken = {
      companyId,
      userId: '189b4fac-9f94-11ed-87e4-ee813b95c72e',
    };
    const roles = [role_name.admin, role_name.employee, role_name.vendor];

    for (const nameOfRole of roles) {
      const temp_payload = {
        role: nameOfRole,
      };
      const role = await addRoleDao(conn, newToken, temp_payload);
      if (nameOfRole === role_name.admin) {
        rolePayload = {
          role: role.id,
        };
      }
    }

    const desPayload = {
      designation: role_name.admin,
      role_id: rolePayload.role,
    };
    const designation = await addDesignationDao(conn, companyId, desPayload);

    const password = generatePassword();
    const userPayload = {
      first_name: verifyDetails.first_name,
      last_name: verifyDetails.last_name,
      email: verifyDetails.email,
      contact_no: verifyDetails.username,
      password,
      config: {
        state: verifyDetails.state,
      },
      role_id: rolePayload.role,
      designation_id: designation.id,
    };
    const adminUser = await processUser(conn, newToken, userPayload);
    if (!adminUser) {
      throw new AuthenticationError('verification failed');
    }
    const currentTime = new Date().getTime();
    const payload = {
      negativeStock: 1,
      verified_at: currentTime,
    };
    const updateComp = await updateCompany(conn, payload, companyId);
    await conn.commit();
    return updateComp;
  } catch (error) {
    logger.log('error while verifying company', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateNegativeStockService = async (payload, companyId) => {
  let conn;

  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await updateNegativeStockDao(conn, payload, companyId);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while updating negative Stock', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateLabelingService = async (payload, companyId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const getComp = await getCompany(conn, companyId);
    const newConfig = getComp[0].config;
    newConfig.labels = payload.labels;
    const data = await updateCompany(conn, newConfig, companyId);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while updating labels', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getCompaniesService,
  getTerritoriesService,
  getnegativeStockService,
  getLabelingService,
  addCompanyService,
  companyVerificationService,
  updateNegativeStockService,
  updateLabelingService,
  getConfigService,
};
