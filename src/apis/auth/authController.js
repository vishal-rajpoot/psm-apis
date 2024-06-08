import jwt from 'jsonwebtoken';
// eslint-disable-next-line import/no-extraneous-dependencies
import otpGenerator from 'otp-generator';
import { sendSuccess } from '../../utils/responseHandler';
import appConfig from '../../config/appconfig';
import { logoutSet } from '../../middlewares/auth';
import {
  doForgotPassword,
  doLogin,
  doLogout,
  doResetPassword,
  doUpdate,
  sendOtpService,
} from './authService';
import {
  // CONFIRM_COMPANY_SCHEMA,
  INSERT_AUTH_SCHEMA,
} from '../../schemas/authSchema';
import { ValidationError } from '../../utils/appErrors';
import { companyVerificationService } from '../companies/companyService';

const login = async (req, res) => {
  const reqBody = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_AUTH_SCHEMA.validate(reqBody, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await doLogin(reqBody);
  return sendSuccess(res, data, 'Login successfully');
};

const companyVerify = async (req, res) => {
  const { token } = req.body;
  // const options = { abortEarly: false };
  // const joiValidation = CONFIRM_COMPANY_SCHEMA.validate(token, options);
  // if (joiValidation.error) {
  //   throw new ValidationError(joiValidation.error);
  // }
  const data = await companyVerificationService(token);
  return sendSuccess(res, data, 'Company Verified Successfully');
};

const update = async (req, res) => {
  const { companyId, userId } = req.user;
  const { config } = req.body;
  const data = await doUpdate(companyId, userId, config);
  return sendSuccess(res, data, 'Token Update successfully');
};

const logout = async (req, res) => {
  const token = req.header('x-auth-token');
  const decodeToken = jwt.verify(token, appConfig.auth.jwt_secret);
  const data = await doLogout(decodeToken);
  logoutSet.add(token);
  return sendSuccess(res, data, 'logout successfully');
};

const sendOtp = async (req, res) => {
  const { mobile_no } = req.body;
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const data = await sendOtpService(mobile_no, otp);
  return sendSuccess(res, { otp: data }, 'otp send successfully');
};

const forgotPassword = async (req, res) => {
  const { mobileNo } = req.body;
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const data = await doForgotPassword(mobileNo, otp);
  return sendSuccess(res, data, 'forgot password successfully');
};

const resetPassword = async (req, res) => {
  const { tempToken, password, mobileNo } = req.body;
  const data = await doResetPassword(tempToken, password, mobileNo);
  return sendSuccess(res, data, 'reset password successfully');
};

// const otpVerify = async (req, res, next) => {
//   const { otp, username } = req.body;
//   const data = await doOtpverify(otp, username, next);
//   return sendSuccess(res, data, 'otp verified successfully');
// };

export {
  login,
  companyVerify,
  update,
  logout,
  sendOtp,
  forgotPassword,
  resetPassword,
  // otpVerify,
};
