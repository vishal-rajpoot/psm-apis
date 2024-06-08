import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getAllDesignationsHierarchy,
  updateDesignationHierarchy,
  deleteDesignationHierarchy,
  getChildDesignation,
  getVendorDesAssignedEmployeeDes,
  getDesignationRelations,
  updateDesignationHierarchyRelation,
  getVendorsUnderEmp,
} from './hierarchyController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get(
  '/designation/',
  isAuthunticated,

  authorized,
  tryCatchHandler(getAllDesignationsHierarchy)
);
router.get(
  '/emp-vendor-designation/:id?',
  isAuthunticated,

  authorized,
  tryCatchHandler(getVendorDesAssignedEmployeeDes)
);
router.put(
  '/designation/relation/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(updateDesignationHierarchyRelation)
);
router.put(
  '/designation/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(updateDesignationHierarchy)
);
router.delete(
  '/designation/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(deleteDesignationHierarchy)
);
router.get(
  '/designation/relation/',
  isAuthunticated,

  authorized,
  tryCatchHandler(getDesignationRelations)
);
router.get(
  '/designation/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(getChildDesignation)
);

router.get(
  '/vendors-under-employee/:id',
  isAuthunticated,

  authorized,
  tryCatchHandler(getVendorsUnderEmp)
);

export default router;
