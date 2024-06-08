import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import {
  getAllLeadActivitiesById,
  getAllLeadActivitiesByUser,
  updateOrderStatusLeadActivities,
} from './leadActivitiesController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get(
  '/:lead/:eventType',
  isAuthunticated,
  tryCatchHandler(getAllLeadActivitiesById)
);
router.get(
  '/user/:id/:eventType',
  isAuthunticated,
  tryCatchHandler(getAllLeadActivitiesByUser)
);
router.put(
  '/order/:id',
  isAuthunticated,
  tryCatchHandler(updateOrderStatusLeadActivities)
);

export default router;
