import { sendSuccess } from '../../utils/responseHandler';
import { getUserTrackingService } from './userTrackingService';

const getUserTracking = async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;
  let dateformate = date;

  if (date === undefined) {
    dateformate = new Date().toISOString().slice(0, 10);
  }

  const token = req.user;

  const data = await getUserTrackingService(token, userId, dateformate);
  return sendSuccess(
    res,
    { locations: data },
    'User tracking getting successfully'
  );
};

export default getUserTracking;
