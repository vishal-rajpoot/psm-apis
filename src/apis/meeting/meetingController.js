import { sendSuccess } from '../../utils/responseHandler';

import { ValidationError } from '../../utils/appErrors';
import {
  getMettingService,
  getMeetingByIdService,
  addMeetingService,
  getExecuteMettingService,
  getScheduleListMettingService,
  getListMettingService,
} from './meetingService';

const getStartmonthDate = () => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  return firstDayOfMonth;
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0'); 

  return `${year}-${month}-${day}`;
};

const getmeeting = async (req, res) => {
  const token = req.user;
  let date;
  if (req.body.date) {
    date = req.body.date;
  } else {
    date = new Date().toISOString().slice(0, 10);
  }
  const data = await getMettingService(token, date);
  return sendSuccess(
    res,
    { meeting: data },
    'getting meeting data successfully'
  );
};

const addMeeting = async (req, res) => {
  const payload = req.body;
  const { companyId, userId } = req.user;
  const data = await addMeetingService(req, payload, companyId, userId);
  return sendSuccess(res, { users: data }, 'Meeting data successfully added');
};
const getMeetingById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getMeetingByIdService(companyId, id);
  return sendSuccess(res, data, 'getting Meeting successfully');
};

const listMeeting = async (req, res) => {
  const token = req.user;
  const startdate = req.query.startdate || getCurrentDate();
  const enddate = req.query.enddate || getCurrentDate();
  const data = await getListMettingService(token, startdate, enddate);
  return sendSuccess(
    res,
    { meeting: data },
    'getting metting list successfully'
  );
};
const executeList = async (req, res) => {
  const token = req.user;
  let date;
  if (req.body.date) {
    date = req.body.date;
  } else {
    date = new Date().toISOString().slice(0, 10);
  }
  const data = await getExecuteMettingService(token, date);
  return sendSuccess(
    res,
    { meeting: data },
    'getting Execute metting list successfully'
  );
};

const scheduleList = async (req, res) => {
  const token = req.user;
  let date;
  if (req.body.date) {
    date = req.body.date;
  } else {
    date = new Date().toISOString().slice(0, 10);
  }
  const data = await getScheduleListMettingService(token, date);
  return sendSuccess(
    res,
    { meeting: data },
    'getting Execute metting list successfully'
  );
};

export {
  getmeeting,
  getMeetingById,
  addMeeting,
  executeList,
  scheduleList,
  listMeeting,
};
