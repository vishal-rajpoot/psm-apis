import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getAllPackages,
  getPackageById,
  addPackage,
  updatePackage,
  deletePackage,
  updatePackageStatus,
} from './packagesController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getAllPackages));
router.get(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getPackageById)
);
router.post('/', isAuthunticated, authorized, tryCatchHandler(addPackage));
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updatePackage));
router.put(
  '/status/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(updatePackageStatus)
);
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deletePackage)
);

export default router;
