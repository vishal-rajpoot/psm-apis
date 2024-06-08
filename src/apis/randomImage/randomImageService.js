/* eslint-disable prefer-promise-reject-errors */
import fs from 'fs';
import crypto from 'crypto';
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getRandomImageDao,
  storeDao,
  updateRandomImageDao,
} from '../../dao/randomImageDao';
import appconfig from '../../config/appconfig';
import { s3 } from '../../utils/aws';
import { BadRequestError } from '../../utils/appErrors';

const logger = new Logger();

const getRandomImageService = async (companyId) => {
  let conn;

  try {
    conn = await db.fetchConn();
    const data = await getRandomImageDao(conn, companyId);
    return data;
  } catch (error) {
    logger.log('error while getting image setting', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateRandomImageService = async (payload, companyId) => {
  let conn;

  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await updateRandomImageDao(conn, payload, companyId);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while updating setting', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const storeService = async (image, companyId, userId) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const uploadedFile = image.user_selfie[0];
    const filePath = uploadedFile.path.replace(/\\/g, '/');
    const fileExtension = uploadedFile.originalname.split('.').pop();

    const randomImageName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString('hex');

    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: appconfig.AWS.bucket,
      Key: `${appconfig.app.env}/selfies/${randomImageName()}.${fileExtension}`,
      Body: fileContent,
    };
    const currentDateTime = new Date();
    const currentDate = currentDateTime.toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          logger.log('Error uploading to AWS:', 'error', err);
          reject('Failed to upload selfie to AWS');
        } else {
          logger.log('Selfie uploaded', 'info', data.Location);
          resolve({ imageUrl: data.Location });
          const store = await storeDao(
            conn,
            data.Location,
            companyId,
            userId,
            currentDate
          );
          if (!store) {
            throw new BadRequestError('error uploading to db');
          }
        }
      });
    });
  } catch (error) {
    logger.log('error while uploading image', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export { getRandomImageService, updateRandomImageService, storeService };
