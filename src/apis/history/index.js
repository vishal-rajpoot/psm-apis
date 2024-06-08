import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import getHistory from './historyController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/:id?', isAuthunticated, authorized, tryCatchHandler(getHistory));

export default router;
