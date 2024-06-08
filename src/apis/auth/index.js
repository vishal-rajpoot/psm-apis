import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import {
  companyVerify,
  login,
  logout,
  sendOtp,
  update,
} from './authController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.post('/login', tryCatchHandler(login));
router.put('/verifyEmail', tryCatchHandler(companyVerify));
router.put('/update', isAuthunticated, tryCatchHandler(update));
router.get('/logout', isAuthunticated, tryCatchHandler(logout));
router.put('/sendOtp', tryCatchHandler(sendOtp));

export default router;
