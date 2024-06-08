import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import tryCatchHandler from '../../utils/tryCatchHandler';
import {
  getDesignations,
  getDesignationById,
  updateDesignation,
  addDesignation,
  deleteDesignation,
  getDesignationsByRoleId,
  addDesignationPriority,
} from './designationController';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getDesignations));
router.get(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getDesignationById)
);
router.get(
  '/by-role/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(getDesignationsByRoleId)
);
router.put(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateDesignation)
);
router.post('/', isAuthunticated, authorized, tryCatchHandler(addDesignation));
router.post(
  '/designationPriority',
  isAuthunticated,
  authorized,
  tryCatchHandler(addDesignationPriority)
);
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteDesignation)
);

export default router;
