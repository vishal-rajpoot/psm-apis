import { role_name } from '../../utils/constants';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';

import { getProfileDao, updateProfileFlagDao } from '../../dao/profileDao';

const logger = new Logger();

const getProfileService = async (token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await getProfileDao(conn, token);
    return data;
  } catch (error) {
    logger.log('error while getting profile', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateProfileFlagService = async (token, id, flag) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    if (token.role_name === role_name.admin) {
      data = await updateProfileFlagDao(conn, token, id, flag);
    }
    return data;
  } catch (error) {
    logger.log('error while updating profile flag', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export { getProfileService, updateProfileFlagService };
