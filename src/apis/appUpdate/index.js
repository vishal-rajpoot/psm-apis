import express from 'express';
import getAppUpdateDetail from './appUpdateController';
import tryCatchHandler from '../../utils/tryCatchHandler';

const router = express.Router();

router.get('/', tryCatchHandler(getAppUpdateDetail));

export default router;
