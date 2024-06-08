import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import getUserTracking from './userTrackingController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/:userId', isAuthunticated, tryCatchHandler(getUserTracking));

export default router;
