import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import { isUploaded } from '../../middlewares/upload';
import {
  startDay,
  getAttendance,
  addLeave,
  getAllAttendance,
  cronNotInYet,
  cronAbsent,
  pauseImage,
  cronEndDay,
} from './attendanceController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.post(
  '/',
  isAuthunticated,
  isUploaded.fields([
    { name: 'user_selfie', maxCount: 1 },
    { name: 'meter_image', maxCount: 1 },
  ]),
  tryCatchHandler(startDay)
);
router.post('/leave', isAuthunticated, authorized, tryCatchHandler(addLeave));
router.get('/', isAuthunticated, authorized, tryCatchHandler(getAttendance));
router.get(
  '/report',
  isAuthunticated,
  authorized,
  tryCatchHandler(getAllAttendance)
);
router.post('/notinyet', isAuthunticated, tryCatchHandler(cronNotInYet));
router.put('/absent', isAuthunticated, tryCatchHandler(cronAbsent));
router.put('/endDay', isAuthunticated, tryCatchHandler(cronEndDay));
router.post(
  '/pause',
  isAuthunticated,
  isUploaded.fields([
    { name: 'user_selfie', maxCount: 1 },
    { name: 'meter_image', maxCount: 1 },
  ]),
  tryCatchHandler(pauseImage)
);

export default router;
