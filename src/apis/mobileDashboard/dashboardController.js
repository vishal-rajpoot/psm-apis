import { sendSuccess } from '../../utils/responseHandler';
import getOrderDetailService from './dashboardService';

const getOrderDetails = async (req, res) => {
  const token = req.user;
  const data = await getOrderDetailService(token);
  return sendSuccess(
    res,
    { details: data },
    'getting data details successfully'
  );
};

export default {};
export { getOrderDetails };
