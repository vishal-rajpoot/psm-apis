import express from 'express';
import { isAuthunticated } from '../../middlewares/auth';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/:id', isAuthunticated, tryCatchHandler(express.static('images')));

export default router;
