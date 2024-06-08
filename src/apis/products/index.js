import express from 'express';
import multer from 'multer';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import tryCatchHandler from '../../utils/tryCatchHandler';
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  uploadProductFile,
  getAllEmployeesAssignedToProductId,
  getAllUnassignedEmployeeForProductId,
  uploadProductFileForMeghmani,
} from './productController';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post(
  '/upload',
  isAuthunticated,
  authorized,
  upload.single('file'),
  tryCatchHandler(uploadProductFile)
);
router.get('/', isAuthunticated, authorized, tryCatchHandler(getAllProducts));
router.get(
  '/assigned-employees/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(getAllEmployeesAssignedToProductId)
);
router.post(
  '/uploadproductmeghmani',
  isAuthunticated,
  authorized,
  upload.single('file'),
  tryCatchHandler(uploadProductFileForMeghmani)
);
router.get(
  '/unassigned-employees/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(getAllUnassignedEmployeeForProductId)
);
router.get(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getProductById)
);
router.post('/', isAuthunticated, authorized, tryCatchHandler(addProduct));
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updateProduct));
router.put(
  '/status/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateProductStatus)
);
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteProduct)
);

export default router;
