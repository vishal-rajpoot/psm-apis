import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getPriceList,
  addPrice,
  updatePrice,
  deletePrice,
} from './vendorPriceController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getPriceList));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addPrice));
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updatePrice));
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deletePrice)
);

export default router;
