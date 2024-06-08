import { sendSuccess } from '../../utils/responseHandler';

import getConfigService from './getConfigService';

const getconfig = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { userId } = req.user;
  const { model, config, key } = req.query;
  const payload = {
    id,
    userId,
    model,
    config,
    companyId,
    key
  };

  const data = await getConfigService(payload);
  return sendSuccess(res, { data }, 'getting data successfully');
};

export default getconfig;
