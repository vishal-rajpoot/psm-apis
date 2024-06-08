import express from 'express';
import multer from 'multer';
import { isAuthunticated } from '../../middlewares/auth';

import {
  uploadTerretorymasterFile,
  getTerretoryDetils,
} from './terretoryMasterController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.put(
  '/upload',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadTerretorymasterFile)
);
router.get('/', isAuthunticated, tryCatchHandler(getTerretoryDetils));

export default router;
