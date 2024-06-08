import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from './categoryController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getAllCategories));
router.get(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getCategoryById)
);
router.post('/', isAuthunticated, authorized, tryCatchHandler(addCategory));
router.put(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateCategory)
);
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteCategory)
);

export default router;
