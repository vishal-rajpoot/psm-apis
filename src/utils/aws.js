/* eslint-disable no-useless-catch */
/* eslint-disable prefer-promise-reject-errors */
import AWS from 'aws-sdk';
import fs from 'fs';
import crypto from 'crypto';
import Logger from './logger';

import appconfig from '../config/appconfig';
import { BadRequestError } from './appErrors';

const logger = new Logger();

const s3 = new AWS.S3({
  accessKeyId: appconfig.AWS.accessKeyId,
  secretAccessKey: appconfig.AWS.secretAccessKey,
  region: appconfig.AWS.region,
});

const uploadToAWS = async (uploadedFile) => {
  const filePath = uploadedFile.path.replace(/\\/g, '/');
  const fileExtension = uploadedFile.originalname.split('.').pop();

  const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString('hex');

  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: appconfig.AWS.bucket,
    Key: `${appconfig.app.env}/images/${randomImageName()}.${fileExtension}`,
    Body: fileContent,
  };

  try {
    const data = new Promise((resolve, reject) => {
      s3.upload(params, (err, inData) => {
        if (err) {
          reject(`Failed to upload ${uploadedFile.fieldname} to AWS : ${err}`);
        } else {
          logger.log(
            `${uploadedFile.fieldname} uploaded`,
            'info',
            inData.Location
          );
          resolve(inData);
        }
      });
    });
    const newData = await data;
    return { imageUrl: newData.Location };
  } catch (error) {
    throw new BadRequestError('Error uploading to AWS');
  }
};
const uploadToAWSbase64 = async (uploadedFile) => {
  const base64Data = uploadedFile.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(base64Data, 'base64');
  const fileExtension = uploadedFile.split(';')[0].split('/')[1];
  const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString('hex');
  const params = {
    Bucket: appconfig.AWS.bucket,
    Key: `${appconfig.app.env}/images/${randomImageName()}.${fileExtension}`,
    Body: buf,
  };

  try {
    const data = new Promise((resolve, reject) => {
      s3.upload(params, (err, inData) => {
        if (err) {
          reject(`Failed to upload ${uploadedFile} to AWS : ${err}`);
        } else {
          resolve(inData);
        }
      });
    });
    const newData = await data;
    return { imageUrl: newData.Location };
  } catch (error) {
    throw new BadRequestError('Error uploading to AWS');
  }
};

export { s3, uploadToAWS, uploadToAWSbase64 };
