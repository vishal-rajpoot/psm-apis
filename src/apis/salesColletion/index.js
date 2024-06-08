import express from 'express';
import multer from 'multer';
import { isAuthunticated } from '../../middlewares/auth';
import tryCatchHandler from '../../utils/tryCatchHandler';
import {
  uploadSalesCollectionFile,
  uploadCustomerCollectionFile,
} from './salesCollectionFileController';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post(
  '/upload',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadSalesCollectionFile)
);

router.post(
  '/customersales/upload',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadCustomerCollectionFile)
);

export default router;
