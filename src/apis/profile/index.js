import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import { getProfile, updateProfileFlag } from './profileController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getProfile));
router.put(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateProfileFlag)
);

export default router;
