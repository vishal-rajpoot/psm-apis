import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import { getOrderDetails } from './dashboardController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, tryCatchHandler(getOrderDetails));

export default router;
