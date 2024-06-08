import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getAllUnassignedUsers,
  getAllEmployeesAssignedByManagerId,
  getAllVendorsAssignedByManagerId,
  addUserAssignments,
  updateUserAssignment,
  updateEmployeeVendorAssignment,
  getEmployeesByVendorId,
} from './userManagementController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get(
  '/unassigned/',
  isAuthunticated,
  authorized,
  tryCatchHandler(getAllUnassignedUsers)
);
router.get(
  '/vendors/:id?',
  isAuthunticated,
  authorized,
  tryCatchHandler(getAllVendorsAssignedByManagerId)
);
router.get(
  '/employee/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(getEmployeesByVendorId)
);
router.get(
  '/:id?',
  isAuthunticated,
  authorized,
  tryCatchHandler(getAllEmployeesAssignedByManagerId)
);
router.post(
  '/',
  isAuthunticated,
  authorized,
  tryCatchHandler(addUserAssignments)
);
router.put('/:id', isAuthunticated, tryCatchHandler(updateUserAssignment));
router.put(
  '/vendors/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateEmployeeVendorAssignment)
);

export default router;
