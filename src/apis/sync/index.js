import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import postSync from './syncController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.post('/', isAuthunticated, tryCatchHandler(postSync));

export default router;
