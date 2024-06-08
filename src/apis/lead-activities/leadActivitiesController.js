import { sendSuccess } from '../../utils/responseHandler';
import {
  getAllLeadActivitiesByIdService,
  getLeadActivitiesByUserService,
  updateOrderStatusLeadActivitiesService,
} from './leadActivitiesService';
import { APPROVED } from '../../utils/constants';

const getAllLeadActivitiesById = async (req, res) => {
  const token = req.user;
  const { lead, eventType } = req.params;
  const { page, limit, sort, column, searchText } = req.query;

  const payload = {
    page: page || 1,
    limit: limit || 10,
    sort: sort || 'DESC',
    column: column || 'created_at',
    searchText,
  };
  const data = await getAllLeadActivitiesByIdService(
    lead,
    token,
    eventType,
    payload
  );
  return sendSuccess(
    res,
    { lead_activities: data },
    'getting lead activities successfully'
  );
};

const getAllLeadActivitiesByUser = async (req, res) => {
  const { page, limit, sort, column, searchText } = req.query;

  const token = req.user;
  const { id, eventType } = req.params;

  const payload = {
    id,
    eventType,
    token,
    searchText,
    page: page || 1,
    limit: limit || 10,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };
  const data = await getLeadActivitiesByUserService(payload);
  return sendSuccess(
    res,
    { lead_activities: data },
    'getting lead activities by user successfully'
  );
};

const updateOrderStatusLeadActivities = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const payload = {
    id,
    status: APPROVED,
    token,
  };
  const data = await updateOrderStatusLeadActivitiesService(payload);
  return sendSuccess(
    res,
    { lead_activities: data },
    'Updating lead order activities status successfully'
  );
};

export {
  getAllLeadActivitiesById,
  getAllLeadActivitiesByUser,
  updateOrderStatusLeadActivities,
};
