import { sendSuccess } from '../../utils/responseHandler';

import postSyncService from './syncService';

const postSync = async (req, res) => {
  const payload = req.body;
  const data = await postSyncService(req, payload);
  return sendSuccess(res, { users: data }, 'Sync data successfully added');
};

export default postSync;
