import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getAllDiscounts,
  getDiscountById,
  addDiscount,
  updateDiscount,
  deleteDiscount,
} from './discountController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getAllDiscounts));
router.get(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getDiscountById)
);
router.put(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateDiscount)
);
router.post('/', isAuthunticated, authorized, tryCatchHandler(addDiscount));
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteDiscount)
);

export default router;
