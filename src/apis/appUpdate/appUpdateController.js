import { sendSuccess } from '../../utils/responseHandler';
import getAppUpdateDetailService from './appUpdateService';

const getAppUpdateDetail = async (req, res) => {
  const data = await getAppUpdateDetailService();
  return sendSuccess(res, data, 'getting app update details successfully');
};

export default getAppUpdateDetail;
