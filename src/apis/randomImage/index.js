import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import {
  getRandomImage,
  store,
  updateRandomImage,
} from './randomImageController';
import tryCatchHandler from '../../utils/tryCatchHandler';
import { isUploaded } from '../../middlewares/upload';

const router = express.Router();

router.get('/', isAuthunticated, tryCatchHandler(getRandomImage));
router.put('/toggle', isAuthunticated, tryCatchHandler(updateRandomImage));
router.put(
  '/',
  isAuthunticated,
  isUploaded.fields([{ name: 'user_selfie', maxCount: 1 }]),
  tryCatchHandler(store)
);
export default router;
