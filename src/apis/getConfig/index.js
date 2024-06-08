import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';

import getconfig from './getConfigController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, tryCatchHandler(getconfig));

export default router;
