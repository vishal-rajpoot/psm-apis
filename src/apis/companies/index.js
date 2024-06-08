import express from 'express';
import multer from 'multer';
import tryCatchHandler from '../../utils/tryCatchHandler';
import {
  addCompany,
  uploadTerritoryFile,
  getTerritories,
  getnegativeStock,
  updateNegativeStock,
  updateLabeling,
  getLabeling,
  getCompanies,
  getconfig,
} from './companyController';
import { isAuthunticated } from '../../middlewares/auth';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/', tryCatchHandler(getCompanies));
router.get('/getconfig', isAuthunticated, tryCatchHandler(getconfig));
router.get('/territories', isAuthunticated, tryCatchHandler(getTerritories));
router.get(
  '/negativeStock',
  isAuthunticated,
  tryCatchHandler(getnegativeStock)
);
router.get('/labeling', isAuthunticated, tryCatchHandler(getLabeling));
router.put(
  '/negativeStock',
  isAuthunticated,
  tryCatchHandler(updateNegativeStock)
);
router.put('/labeling', isAuthunticated, tryCatchHandler(updateLabeling));
router.post('/', tryCatchHandler(addCompany));
router.post(
  '/upload',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadTerritoryFile)
);

export default router;
