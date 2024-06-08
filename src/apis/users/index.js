import express from 'express';
import multer from 'multer';
import { isAuthunticated } from '../../middlewares/auth';

import {
  getUsers,
  getUserById,
  getUsersByDesignation,
  updateUser,
  addUser,
  deleteUser,
  uploadUserFile,
  updateUserDesignation,
  updatePassword,
  signup,
  assigneDeleteUser,
  RegisteredUser,
  getUsersByDesignationDeleted,
  statusChange,
  RegisteredMda,
  getEmployee,
  uploadEmployeeFile,
  uploadCustomerFile,
} from './userController';
import tryCatchHandler from '../../utils/tryCatchHandler';
import { isMda } from '../../middlewares/upload';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post(
  '/upload',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadUserFile)
);

router.get('/status', isAuthunticated, tryCatchHandler(RegisteredUser));
router.post(
  '/signup/mda',
  isAuthunticated,
  isMda.fields([
    { name: 'aadhar_card_front', maxCount: 1 },
    { name: 'aadhar_card_back', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 },
    { name: 'bank_detail', maxCount: 1 },
  ]),
  tryCatchHandler(RegisteredMda)
);
router.get('/', isAuthunticated, tryCatchHandler(getUsers));
router.get('/getEmployee', isAuthunticated, tryCatchHandler(getEmployee));
router.get(
  '/designation/:designationId',
  isAuthunticated,
  tryCatchHandler(getUsersByDesignation)
);
router.post(
  '/uploadcustomer',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadCustomerFile)
);
router.get(
  '/designation/deleted/:deletedesignationId',
  isAuthunticated,
  tryCatchHandler(getUsersByDesignationDeleted)
);
router.get('/:id', isAuthunticated, tryCatchHandler(getUserById));
router.post(
  '/employee/upload',
  isAuthunticated,
  upload.single('file'),
  tryCatchHandler(uploadEmployeeFile)
);
router.put('/:id', isAuthunticated, tryCatchHandler(updateUser));

router.post('/', isAuthunticated, tryCatchHandler(addUser));
router.post('/signup', tryCatchHandler(signup));
router.delete('/:id', isAuthunticated, tryCatchHandler(deleteUser));
router.put(
  '/designation/:id',
  isAuthunticated,
  tryCatchHandler(updateUserDesignation)
);
router.put(
  '/changePassword/:id',
  isAuthunticated,
  tryCatchHandler(updatePassword)
);
router.post(
  '/assignedeleteuser',
  isAuthunticated,
  tryCatchHandler(assigneDeleteUser)
);
router.post('/statusChange', isAuthunticated, tryCatchHandler(statusChange));
export default router;
