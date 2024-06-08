import express from 'express';
import tryCatchHandler from '../../utils/tryCatchHandler';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  addInvoice,
  addInvoicePrefix,
  deleteInvoice,
  getAllInvoices,
  getInvoicePrefix,
  getInvoiceYear,
  updateInvoice,
} from './invoiceController';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getAllInvoices));
router.get(
  '/year',
  isAuthunticated,
  authorized,
  tryCatchHandler(getInvoiceYear)
);
router.get(
  '/invoice_number',
  isAuthunticated,

  authorized,
  tryCatchHandler(getInvoicePrefix)
);
router.post(
  '/invoice_number',
  isAuthunticated,

  authorized,
  tryCatchHandler(addInvoicePrefix)
);
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updateInvoice));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addInvoice));
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteInvoice)
);

export default router;
