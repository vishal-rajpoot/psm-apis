import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';

import {
  getUserActivities,
  getUserActivitiesById,
  getOrderByStatus,
  getVendorOrderById,
  discussionOrReminderById,
  updateUserActivities,
  deleteUserActivities,
  changeOrderStatus,
  getCompetitorStockByUserId,
  getOwnStockByUserId,
} from './userActivitiesController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get(
  '/user/vendor/:id',
  isAuthunticated,
  tryCatchHandler(getVendorOrderById)
);
router.get(
  '/user/vendor/competitorstock/:id',
  isAuthunticated,
  tryCatchHandler(getCompetitorStockByUserId)
);
router.get(
  '/user/vendor/ownstock/:id',
  isAuthunticated,
  tryCatchHandler(getOwnStockByUserId)
);
router.get(
  '/user/:id?',
  isAuthunticated,
  authorized,
  tryCatchHandler(getUserActivities)
);
router.get(
  '/status/',
  isAuthunticated,
  authorized,
  tryCatchHandler(getOrderByStatus)
);
router.get(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getUserActivitiesById)
);
router.put(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateUserActivities)
);
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteUserActivities)
);
router.put(
  '/status/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(changeOrderStatus)
);
router.get(
  '/discussion/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(discussionOrReminderById)
);

export default router;
