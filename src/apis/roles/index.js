import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  getRoles,
  getRoleById,
  updateRole,
  addRole,
  deleteRole,
} from './rolesController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getRoles));
router.get('/:id', isAuthunticated, authorized, tryCatchHandler(getRoleById));
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updateRole));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addRole));
router.delete('/:id', isAuthunticated, authorized, tryCatchHandler(deleteRole));

export default router;
