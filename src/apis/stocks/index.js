import express from 'express';
import multer from 'multer';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getStocks,
  getStocksById,
  addStock,
  uploadProductStockFile,
  updateStock,
  removeStock,
} from './stocksController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post(
  '/upload',
  isAuthunticated,
  authorized,
  upload.single('file'),
  tryCatchHandler(uploadProductStockFile)
);
router.get('/', isAuthunticated, authorized, tryCatchHandler(getStocks));
router.get('/:id', isAuthunticated, authorized, tryCatchHandler(getStocksById));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addStock));
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updateStock));
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(removeStock)
);

export default router;
