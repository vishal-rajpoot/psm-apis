import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import tryCatchHandler from '../../utils/tryCatchHandler';
import {
  getmeeting,
  getMeetingById,
  addMeeting,
  executeList,
  scheduleList,
  listMeeting,
} from './meetingController';

const router = express.Router();
router.get('/list', isAuthunticated, tryCatchHandler(listMeeting));

router.post('/add-meeting', isAuthunticated, tryCatchHandler(addMeeting));
router.post('/schedule-list', isAuthunticated, tryCatchHandler(scheduleList));
router.post('/execute-list', isAuthunticated, tryCatchHandler(executeList));
router.get('/:id', isAuthunticated, tryCatchHandler(getMeetingById));
router.get('/', isAuthunticated, tryCatchHandler(getmeeting));

export default router;
