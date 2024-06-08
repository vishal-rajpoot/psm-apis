/* eslint-disable no-else-return */
// import bcrypt from 'bcryptjs';
// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
// eslint-disable-next-line import/no-extraneous-dependencies
import twilio from 'twilio';
import * as db from '../../utils/db';
import * as authUtils from '../../utils/auth';
import {
  getUserbyContactNoDao,
  updatePasswordDao,
  updateUserDao,
} from '../../dao/userDao';
import { BadRequestError } from '../../utils/appErrors';
import { addLoginDao, logoutDao, updateDao } from '../../dao/loginDao';
import Logger from '../../utils/logger';
import processRequest from '../../middlewares/loginRequest';
import { STATUS } from '../../utils/constants';
import appconfig from '../../config/appconfig';

const { account_sid, auth_token } = appconfig.twilio;

const client = twilio(account_sid, auth_token);

const logger = new Logger();

const doLogin = async (requestBody) => {
  const { username, otp } = requestBody;
  const { config } = requestBody;
  let conn;
  try {
    conn = await db.fetchConn();

    const data = await getUserbyContactNoDao(conn, username);
    if (!data) {
      throw new BadRequestError('User not exist');
    }

    const payload = {
      first_name: data?.first_name,
      last_name: data?.last_name,
      email: data?.email,
      contact_no: data?.contact_no,
      status: data?.status,
      config: data?.config,
    };
    const token = {
      companyId: data?.company,
    };

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - data.config.otpExpirationTime;
    const validDuration = 2 * 60 * 1000;
    if (timeDifference <= validDuration) {
      if (otp === data.config.otp) {
        updateUserDao(conn, data.id, payload, token);
      } else {
        throw new BadRequestError('Invalid Otp');
      }
    } else {
      throw new BadRequestError('Otp is Expired !!!');
    }

    if (data.status === STATUS.IN_ACTIVE) {
      throw new BadRequestError('Unable to login. User Inactive');
    }
    // const isPasswordCorrect = bcrypt.compareSync(password, data.password);
    // if (!isPasswordCorrect) {
    //   throw new BadRequestError('Invalid credentials');
    // }

    const isRequestVerified = await processRequest(
      config.source,
      data.role_name
    );
    // if (!isRequestVerified) {zzz
    //   throw new BadRequestError('Invalid source or role combination');
    // }

    const loginData = await addLoginDao(conn, data.id, config, data.company);
    const tokenInfo = authUtils.createNewToken({
      username: data.contact_no,
      userId: data.id,
      designationId: data.designation,
      designation_name: data.designation_name,
      roleId: data.role,
      role_name: data.role_name,
      companyId: data.company,
      source: loginData.config.source,
      loginId: loginData.id,
    });
    return tokenInfo;
  } catch (err) {
    logger.log('error while login user', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const doUpdate = async (companyId, userId, config) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await updateDao(conn, companyId, userId, config);
    return data;
  } catch (err) {
    logger.log('error while updating user', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const doLogout = async (decodeToken) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await logoutDao(conn, decodeToken);
    const user = await getUserbyContactNoDao(conn, decodeToken.username);
    user.config.otpExpirationTime = '';
    const token = {
      companyId: decodeToken.companyId,
    };
    await updateUserDao(conn, user.id, user, token);
    return data;
  } catch (err) {
    logger.log('error while logout user', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const sendOtpService = async (mobileNo, otp) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();

    const getUser = await getUserbyContactNoDao(conn, mobileNo);
    if (!getUser) {
      throw new BadRequestError('User not Exist!');
    }
    const currentTime = new Date().getTime();
    const expirationTime = new Date().getTime() + 2 * 60 * 1000;
    const timeDifference = getUser.config.otpExpirationTime - currentTime;

    const totalSeconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeString = `${minutes} minutes: ${seconds} seconds`;

    if (timeDifference >= 0) {
      throw new BadRequestError(`Please wait for ${timeString}`);
    }

    const { id } = getUser;
    getUser.config.otp = otp;
    getUser.config.otpExpirationTime = expirationTime;
    const payload = {
      first_name: getUser.first_name,
      last_name: getUser.last_name,
      email: getUser.email,
      contact_no: getUser.contact_no,
      status: getUser.status,
      config: getUser.config,
    };
    const token = {
      companyId: getUser.company,
    };
    const url = `http://login.aquasms.com/sendSMS?username=bhavik15vora@gmail.com&message=Your
                  One Time Password is ${otp}&sendername=ASKGSN&smstype=TRANS&numbers=+91${mobileNo}&apikey=753b97b5-bd05-4077-9c91-84149e6b15eb`;
    try {
      const response = await fetch(url);
      logger.log('otp sent on mobile No', 'info', response);
    } catch (err) {
      throw new BadRequestError(err.code);
    }
    const data = await updateUserDao(conn, id, payload, token);
    await conn.commit();
    return otp; // this should be changed before deploying to production/prod  return otp => data
  } catch (err) {
    logger.log('error while sending otp', 'error', err);
    await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const doForgotPassword = async (mobileNo, otp) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const getUser = await getUserbyContactNoDao(conn, mobileNo);
    if (!getUser) {
      throw new BadRequestError('User not Exist!');
    }
    const expirationTime = new Date().getTime() + 5 * 60 * 1000;
    const { id } = getUser;
    getUser.config.otp = otp;
    getUser.config.otpExpirationTime = expirationTime;
    const payload = {
      first_name: getUser.first_name,
      last_name: getUser.last_name,
      email: getUser.email,
      contact_no: getUser.contact_no,
      status: getUser.status,
      config: getUser.config,
    };
    const token = {
      companyId: getUser.company,
    };
    const convertedMobileNo = `+91${mobileNo}`;
    const messageOptions = {
      from: appconfig.twilio.mobile_no,
      to: convertedMobileNo,
      body: otp,
    };
    try {
      const response = await client.messages.create(messageOptions);
      logger.log('message sent', 'info', response);
    } catch (err) {
      logger.log('error while sending message to user', 'error', err);
    }

    const data = await updateUserDao(conn, id, payload, token);
    return data;
  } catch (err) {
    logger.log('error while getting forgot password', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const doResetPassword = async (tempToken, password, mobileNo) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const hashedPassword = authUtils.hashValue(password);
    const getUser = await getUserbyContactNoDao(conn, mobileNo);
    if (!getUser) {
      throw new BadRequestError('User not Exist!');
    }
    const { id, company } = getUser;

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - getUser.config.tokenExpirationTime;
    const validDuration = 5 * 60 * 1000;

    if (timeDifference <= validDuration) {
      if (tempToken === getUser.config.tempToken.tempToken) {
        const data = await updatePasswordDao(conn, id, company, hashedPassword);
        const decodeToken = jwt.verify(tempToken, appconfig.auth.temp_token);
        await logoutDao(conn, decodeToken);
        return data;
      } else {
        throw new BadRequestError('Invalid token');
      }
    } else {
      throw new BadRequestError('Token Expired !!!');
    }
  } catch (err) {
    logger.log('error while resetting password', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  doLogin,
  doUpdate,
  doLogout,
  sendOtpService,
  doForgotPassword,
  doResetPassword,
};
