import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import {
  addTarget,
  getTotalRevenueByCompany,
  getTotalRevenueByUser,
  getTargetList,
  getTargetHierarchy,
  deleteTarget,
  updateTarget,
} from './targetController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get(
  '/company/',
  isAuthunticated,
  tryCatchHandler(getTotalRevenueByCompany)
);
router.get('/list/', isAuthunticated, tryCatchHandler(getTargetList));
router.get('/all/:id', isAuthunticated, tryCatchHandler(getTargetHierarchy));
router.get(
  '/:userId?',
  isAuthunticated,
  tryCatchHandler(getTotalRevenueByUser)
);
router.put('/:id', isAuthunticated, tryCatchHandler(updateTarget));
router.post('/', isAuthunticated, tryCatchHandler(addTarget));
router.delete('/:id', isAuthunticated, tryCatchHandler(deleteTarget));

export default router;
