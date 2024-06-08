import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  deleteInventory,
  getInventory,
  getInventoryById,
} from './inventoryController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getInventory));
router.get(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getInventoryById)
);
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteInventory)
);

export default router;
