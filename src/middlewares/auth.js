import jwt from 'jsonwebtoken';
import appConfig from '../config/appconfig';
import { AUTH_HEADER_KEY, designation, source_name } from '../utils/constants';
import { AuthenticationError } from '../utils/appErrors';

const logoutSet = new Set();

const isAuthunticated = (req, res, next) => {
  const token = req.header(AUTH_HEADER_KEY);

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  if (logoutSet.has(token)) {
    throw new AuthenticationError('Token expired or User logged out.');
  }

  try {
    const decoded = jwt.verify(token, appConfig.auth.jwt_secret);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};

const authorized = (req, res, next) => {
  // const { designation_name, source } = req.user;
  // if (
  //   (designation_name !== (designation.NH || designation.admin) &&
  //     source !== source_name.web) ||
  //   (designation_name === (designation.NH || designation.admin) &&
  //     source !== source_name.mobile)
  // ) {
  //   throw new AuthenticationError('User not authorized to perform this action');
  // }
  next();
};

export { isAuthunticated, logoutSet, authorized };
