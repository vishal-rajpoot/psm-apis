import {
  UPDATE_ORDER_STATUS,
  UPDATE_USER_ACTIVITIY,
} from '../../schemas/userActivitiesSchema';
import { ValidationError } from '../../utils/appErrors';
import { sendSuccess } from '../../utils/responseHandler';

import {
  getUserActivitiesService,
  getUserActivitiesByIdService,
  discussionOrReminderByIdService,
  updateUserActivitiesService,
  deleteUserActivitiesService,
  getOrderByStatusService,
  changeOrderStatusService,
  reminderCronJobService,
  getVendorOrderByIdService,
  getVendorCompetitorStockService,
  getVendorOwnStockService,
} from './userActivitiesService';

const getVendorOrderById = async (req, res) => {
  const { startDate, endDate } = req.query;
  const { companyId } = req.user;
  const { id } = req.params;

  const data = await getVendorOrderByIdService(
    companyId,
    id,
    startDate,
    endDate
  );
  return sendSuccess(
    res,
    { UserActivities: data },
    'getting User data successfully'
  );
};

const getUserActivities = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  let userId = id;
  if (id === undefined) {
    userId = req.user.userId;
  }
  const {
    event_type,
    startDate,
    endDate,
    page,
    limit,
    sort,
    column,
    searchText,
  } = req.query;
  const payload = {
    id: userId,
    companyId,
    event_type,
    event_type_lead: `lead_${event_type}`,
    startDate,
    endDate,
    page: page || 1,
    limit: limit || 10,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
  };

  const data = await getUserActivitiesService(payload);
  return sendSuccess(
    res,
    { UserActivities: data },
    'getting User data successfully'
  );
};
const getCompetitorStockByUserId = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getVendorCompetitorStockService(companyId, id);
  return sendSuccess(
    res,
    { UserActivities: data },
    'getting Competitor Stock data successfully'
  );
};
const getOwnStockByUserId = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getVendorOwnStockService(companyId, id);
  return sendSuccess(
    res,
    { UserActivities: data },
    'getting Own Stock data successfully'
  );
};

const getOrderByStatus = async (req, res) => {
  const { companyId, userId, designationId, roleId } = req.user;
  const {
    event_type,
    status,
    startDate,
    endDate,
    page,
    limit,
    sort,
    column,
    searchText,
  } = req.query;
  const payload = {
    companyId,
    event_type,
    status,
    startDate,
    endDate,
    searchText,
    page: page || 1,
    limit: limit || 10,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getOrderByStatusService(
    payload,
    userId,
    designationId,
    roleId
  );
  return sendSuccess(
    res,
    { UserActivities: data },
    'getting UserActivities by status successfully'
  );
};

const getUserActivitiesById = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const payload = {
    token,
    id,
  };
  const data = await getUserActivitiesByIdService(payload);
  return sendSuccess(
    res,
    { UserActivities: data },
    'getting UserActivities by id successfully'
  );
};

const updateUserActivities = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { config } = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_USER_ACTIVITIY.validate(config, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateUserActivitiesService(companyId, id, config);
  return sendSuccess(res, data, 'updating UserActivities successfully');
};

const deleteUserActivities = async (req, res) => {
  const { companyId } = req.user;
  const { orderId } = req.params;
  const data = await deleteUserActivitiesService(companyId, orderId);
  return sendSuccess(res, data, 'deleting UserActivities successfully');
};

const changeOrderStatus = async (req, res) => {
  const { id } = req.params;
  const token = req.user;
  const { status, event_type, reason } = req.body;

  const payload = {
    token,
    id,
    status,
    event_type,
    reason,
  };
  const options = { abortEarly: false };
  const joiValidation = UPDATE_ORDER_STATUS.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await changeOrderStatusService(payload);
  return sendSuccess(res, data, `Order ${status} successfully`);
};

const discussionOrReminderById = async (req, res) => {
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const { event_type } = req.query;
  const payload = {
    companyId,
    userId,
    event_type,
    id,
  };
  const data = await discussionOrReminderByIdService(payload);
  return sendSuccess(
    res,
    { activity: data },
    ` ${event_type} UserActivities data successfully`
  );
};

const reminderCronJob = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yyyy = tomorrow.getFullYear();
  let mm = tomorrow.getMonth() + 1; // Months start at 0!
  let dd = tomorrow.getDate();
  if (dd < 10) dd = `0${dd}`;
  if (mm < 10) mm = `0${mm}`;
  const dateformat = `${yyyy}-${mm}-${dd}`;

  await reminderCronJobService(dateformat);
};

export {
  getUserActivities,
  getOrderByStatus,
  getUserActivitiesById,
  discussionOrReminderById,
  updateUserActivities,
  deleteUserActivities,
  changeOrderStatus,
  getVendorOrderById,
  reminderCronJob,
  getCompetitorStockByUserId,
  getOwnStockByUserId,
};
