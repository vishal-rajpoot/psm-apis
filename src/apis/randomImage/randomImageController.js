// import fs from 'fs';
// import path from 'path';
import { ValidationError } from '../../utils/appErrors';
import { sendSuccess } from '../../utils/responseHandler';
import {
  INSERT_RANDOM_IMAGE_SCHEMA,
  UPDATE_RANDOM_IMAGE_SCHEMA,
} from '../../schemas/randomImageSchema';
import {
  getRandomImageService,
  storeService,
  updateRandomImageService,
} from './randomImageService';

const getRandomImage = async (req, res) => {
  const { companyId } = req.user;
  const data = await getRandomImageService(companyId);
  return sendSuccess(res, data, 'getting image setting successfully');
};

const updateRandomImage = async (req, res) => {
  const payload = req.body;
  const { companyId } = req.user;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_RANDOM_IMAGE_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateRandomImageService(payload, companyId);
  return sendSuccess(res, data, 'Setting updated successfully');
};

const store = async (req, res) => {
  const image = req.files;
  const { companyId, userId } = req.user;
  const options = { abortEarly: false };
  const joiValidation = INSERT_RANDOM_IMAGE_SCHEMA.validate({ image }, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await storeService(image, companyId, userId);
  return sendSuccess(res, data, 'Selfie uploaded successfully');
};

export { getRandomImage, updateRandomImage, store };
