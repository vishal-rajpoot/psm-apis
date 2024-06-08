import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';

import { addApproval, getApproval } from './featureApprovalController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();
router.get('/', isAuthunticated, authorized, tryCatchHandler(getApproval));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addApproval));

export default router;
