import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import tryCatchHandler from '../../utils/tryCatchHandler';
import { getTax, updateTax } from './taxController';

const router = express.Router();

router.get('/', isAuthunticated, tryCatchHandler(getTax));
router.put('/update', isAuthunticated, tryCatchHandler(updateTax));

export default router;
