import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import {
  getNotifications,
  addHolidaysNotifications,
  deleteHolidaysNotifications,
  getHolidaysNotifications,
} from './notificationController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, tryCatchHandler(getNotifications));

router.post('/', isAuthunticated, tryCatchHandler(addHolidaysNotifications));
router.delete(
  '/holidays/:id',
  isAuthunticated,
  tryCatchHandler(deleteHolidaysNotifications)
);

router.get(
  '/holidays',
  isAuthunticated,
  tryCatchHandler(getHolidaysNotifications)
);

export default router;
