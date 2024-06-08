import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import appConfig from '../config/appconfig';
import { BadRequestError } from './appErrors';

const createNewToken = (data) => {
  const accessToken = jwt.sign(data, appConfig.auth.jwt_secret, {
    expiresIn: appConfig.auth.jwt_expiresin,
  });
  const refreshToken = jwt.sign(data, appConfig.auth.refresh_token_secret, {
    expiresIn: appConfig.auth.refresh_token_expiresin,
  });
  return {
    accessToken,
    refreshToken,
  };
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, appConfig.auth.jwt_secret);
    return decoded;
  } catch (ex) {
    return false;
  }
};

const hashValue = (value) => {
  try {
    const salt = bcrypt.genSaltSync(15);
    const stringValue = String(value);
    return bcrypt.hashSync(stringValue, salt);
  } catch (error) {
    throw new BadRequestError('Error in hashValue:', error);
  }
};

const createTemporaryToken = (data) => {
  const tempToken = jwt.sign(data, appConfig.auth.temp_token, {
    expiresIn: appConfig.auth.temp_token_expires,
  });
  return {
    tempToken,
  };
};

export { createNewToken, verifyToken, hashValue, createTemporaryToken };
