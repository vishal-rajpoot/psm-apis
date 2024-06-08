import express from 'express';
import multer from 'multer';
import { isAuthunticated } from '../../middlewares/auth';
import tryCatchHandler from '../../utils/tryCatchHandler';
import {
  getAllLeads,
  getLeadById,
  addLead,
  updateLead,
  deleteLead,
  getEmployeeLeads,
  transferLead,
  updatetransferLead,
  getLeadsByStatus,
  uploadLeadFile,
  rejectLead,
  approveLead,
} from './leadsController';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/', isAuthunticated, tryCatchHandler(getAllLeads));
router.get(
  '/employee/:id?',
  isAuthunticated,
  tryCatchHandler(getEmployeeLeads)
);
router.post(
  '/upload',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadLeadFile)
);
router.get('/status/', isAuthunticated, tryCatchHandler(getLeadsByStatus));
router.get('/:id', isAuthunticated, tryCatchHandler(getLeadById));
router.post('/', isAuthunticated, tryCatchHandler(addLead));
router.put('/transfer', isAuthunticated, tryCatchHandler(updatetransferLead));
router.put('/:id', isAuthunticated, tryCatchHandler(updateLead));
router.delete('/:id', isAuthunticated, tryCatchHandler(deleteLead));
router.post('/transfer/:id', isAuthunticated, tryCatchHandler(transferLead));
router.put('/reject/:id', isAuthunticated, tryCatchHandler(rejectLead));
router.post('/approve/:id', isAuthunticated, tryCatchHandler(approveLead));

export default router;
