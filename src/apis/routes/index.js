import express from 'express';
import { authorized, isAuthunticated } from '../../middlewares/auth';
import {
  addRoute,
  deleteRoute,
  getAllRoutes,
  getRouteById,
  updateAssignEmployee,
  updateRoute,
} from './routeController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', isAuthunticated, authorized, tryCatchHandler(getAllRoutes));
router.get('/:id', isAuthunticated, authorized, tryCatchHandler(getRouteById));
router.post('/', isAuthunticated, authorized, tryCatchHandler(addRoute));
router.put(
  '/assignEmployee/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(updateAssignEmployee)
);
router.put('/:id', isAuthunticated, authorized, tryCatchHandler(updateRoute));
router.delete(
  '/:id',
  isAuthunticated,
  authorized,
  tryCatchHandler(deleteRoute)
);

export default router;
