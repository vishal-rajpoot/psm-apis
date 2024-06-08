import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import {
  getmiscResourceEntries,
  addMiscResoureEntries,
} from './miscResoureEntriesController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get(
  '/resourcetype/',
  isAuthunticated,
  tryCatchHandler(getmiscResourceEntries)
);

router.post('/', isAuthunticated, tryCatchHandler(addMiscResoureEntries));

export default router;
