import { sendSuccess } from '../../utils/responseHandler';
import getAllCountsService from './sideService';

const getAllCounts = async (req, res) => {
  const { companyId } = req.user;
  const { vendorRoleId, employeeRoleId } = req.query;
  const data = await getAllCountsService(
    companyId,
    vendorRoleId,
    employeeRoleId
  );
  return sendSuccess(res, data, 'getting counts successfully');
};

export default getAllCounts;
