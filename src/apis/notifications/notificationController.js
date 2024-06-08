import { sendSuccess } from '../../utils/responseHandler';
import {
  getNotificationService,
  addHolidaysNotificationService,
  deleteHolidaysNotificationService,
  getHolidaysService,
} from './notificationService';

const getNotifications = async (req, res) => {
  const token = req.user;
  const data = await getNotificationService(token);
  return sendSuccess(
    res,
    { notification: data },
    ' gettting notifications successfully'
  );
};
const addHolidaysNotifications = async (req, res) => {
  const { companyId } = req.user;
  const payload = req.body;
  const data = await addHolidaysNotificationService(companyId, payload);
  return sendSuccess(
    res,
    { notification: data },
    ' Add notifications data successfully'
  );
};
const deleteHolidaysNotifications = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await deleteHolidaysNotificationService(companyId, id);
  return sendSuccess(res, data, 'deleted successfully');
};
const getHolidaysNotifications = async (req, res) => {
  const { companyId } = req.user;
  const data = await getHolidaysService(companyId);
  return sendSuccess(
    res,
    { Holidays: data },
    ' gettting Holidays List successfully'
  );
};

export {
  getNotifications,
  addHolidaysNotifications,
  deleteHolidaysNotifications,
  getHolidaysNotifications,
};
