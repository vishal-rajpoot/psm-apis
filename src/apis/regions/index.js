import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getRegions,
  getRegionById,
  updateRegion,
  addRegion,
  deleteRegion,
} from './regionController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getRegions));
router.get('/:id', isAuthunticated, authorized, tryCatchHandler(getRegionById));
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updateRegion));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addRegion));
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteRegion)
);

export default router;
