import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import getAllCounts from './sideController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, tryCatchHandler(getAllCounts));

export default router;
