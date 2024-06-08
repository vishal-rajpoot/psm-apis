import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getUnits,
  getUnitById,
  updateUnit,
  addUnit,
  deleteUnit,
  updateUnitHierarchy,
} from './unitController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getUnits));
router.get('/:id', isAuthunticated, authorized, tryCatchHandler(getUnitById));
router.put(
  '/hierarchy/',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateUnitHierarchy)
);
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updateUnit));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addUnit));
router.delete('/:id', isAuthunticated, authorized, tryCatchHandler(deleteUnit));

export default router;
