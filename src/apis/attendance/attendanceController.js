import cron from 'node-cron';
import { sendSuccess } from '../../utils/responseHandler';
import {
  INSERT_ATTENDANCE_SCHEMA,
  INSERT_LEAVE_SCHEMA,
} from '../../schemas/attendanceSchema';
import {
  startDayService,
  getAttendanceService,
  addLeaveService,
  cronEndDayService,
  getAllAttendanceService,
  logoutNotificationService,
  loginNotificationService,
  cronNotInYetService,
  cronAbsentService,
  getListOfNotReceiveNotification,
  pauseService,
} from './attendanceService';
import { ValidationError } from '../../utils/appErrors';
import {
  CRONJOB_TIME,
  CRON_START_DAY,
  CRON_REMINDER_DAY,
  CRON_END_DAY,
  END_DAY,
  START_DAY,
  NOT_IN_YET,
  ABSENT,
  CRON_NOT_IN_YET,
  CRON_ABSENT,
  CRONJOB_22_MIN,
} from '../../utils/constants';
import { reminderCronJob } from '../userActivities/userActivitiesController';

const cronEndDay = async (req, res) => {
  const payload = { cron: 'cron job is running', is_flag: '0' };
  const data = await cronEndDayService(payload);
  return sendSuccess(res, { employees: data }, 'end day successfully');
};

const cronNotInYet = async (req, res) => {
  const payload = { employee_status: `${NOT_IN_YET} : system generated ` };
  const data = await cronNotInYetService(payload);
  return sendSuccess(res, { employees: data }, 'entries added successfully');
};

const cronAbsent = async (req, res) => {
  const payload = { employee_status: `${ABSENT}` };
  const data = await cronAbsentService(payload);
  return sendSuccess(res, { employees: data }, 'Absent user successfully');
};

const startDayNotification = async (req, res) => {
  const title = 'test notification here';
  const body = 'Please login, Start you day';
  const dateformat = new Date().toISOString().slice(0, 10);
  const start = START_DAY;
  const data = await loginNotificationService(title, body, start, dateformat);
  return sendSuccess(
    res,
    { Notification: data },
    'Notification send successfully'
  );
};

const EndDayNotification = async (req, res) => {
  const title = 'test notification here';
  const body = 'Please logout, End you day';
  const dateformat = new Date().toISOString().slice(0, 10);
  const end = END_DAY;
  const start = START_DAY;

  const data = await logoutNotificationService(
    title,
    body,
    end,
    start,
    dateformat
  );
  return sendSuccess(
    res,
    { Notification: data },
    'Notification send successfully'
  );
};

const checkLastEntry = async () => {
  const title = 'Please open app';
  const body = 'Please open app';
  await getListOfNotReceiveNotification(title, body);
};

cron.schedule(CRONJOB_22_MIN, checkLastEntry);
cron.schedule(CRONJOB_TIME, cronEndDay);
cron.schedule(CRON_END_DAY, EndDayNotification);
cron.schedule(CRON_START_DAY, startDayNotification);
cron.schedule(CRON_REMINDER_DAY, reminderCronJob);
cron.schedule(CRON_NOT_IN_YET, cronNotInYet);
cron.schedule(CRON_ABSENT, cronAbsent);

const startDay = async (req, res) => {
  const payload = req.body;
  const token = req.user;
  const images = req.files;
  const date = new Date().toISOString().slice(0, 10);
  const options = { abortEarly: false };

  const joiValidation = INSERT_ATTENDANCE_SCHEMA.validate(
    { images, ...payload },
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await startDayService(payload, token, images, date);
  return sendSuccess(
    res,
    { attendance: data },
    'Attendance status change successfully'
  );
};
const pauseImage = async (req, res) => {
  const token = req.user;
  const images = req.files;
  const data = await pauseService(token, images);
  return sendSuccess(res, { pause: data }, 'Pause Image Save successfully');
};

const getAttendance = async (req, res) => {
  const token = req.user;
  let date;
  if (req.query.date) {
    date = req.query.date;
  } else {
    date = new Date().toISOString().slice(0, 10);
  }

  const data = await getAttendanceService(date, token);
  return sendSuccess(res, data, 'getting attendance successfully');
};

const addLeave = async (req, res) => {
  const token = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_LEAVE_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addLeaveService(payload, token);
  return sendSuccess(res, data, 'Leave added successfully');
};

const getAllAttendance = async (req, res) => {
  const token = req.user;
  let startDate;
  let endDate;
  const { page, limit, sort, column } = req.query;
  if (req.query.startDate) {
    startDate = req.query.startDate;
    endDate = req.query.endDate;
  } else {
    startDate = new Date().toISOString().slice(0, 10);
    endDate = new Date().toISOString().slice(0, 10);
  }

  const payload = {
    startDate,
    endDate,
    event_type: START_DAY,
    page,
    limit,
    sort: sort || 'DESC',
    column: column || 'created_at',
  };

  const data = await getAllAttendanceService(payload, token);
  return sendSuccess(
    res,
    { Attendance: data },
    'getting attendance successfully'
  );
};

export {
  startDay,
  cronEndDay,
  getAttendance,
  addLeave,
  getAllAttendance,
  cronNotInYet,
  cronAbsent,
  checkLastEntry,
  pauseImage,
};
