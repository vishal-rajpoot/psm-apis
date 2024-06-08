import express from 'express';
import { pong, hash } from './pingController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', tryCatchHandler(pong));
router.get('/hash/:id', tryCatchHandler(hash));

export default router;
