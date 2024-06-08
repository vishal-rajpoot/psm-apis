/* eslint-disable no-new */
import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  getStartDateDao,
  getUserActivitiesByIdDao,
} from '../../dao/userActivitiesDao';
import calculateDistance from '../../middlewares/googleDistance';
import {
  getUsersByRoleDao,
  startDayDao,
  endDayDao,
  getAttendanceDao,
  checkDayDao,
  checkLeaveDao,
  addLeaveDao,
  getEmployeeRolesIdDao,
  getAllAttendanceDao,
  getTrackingDao,
  checkEventType,
  cronAbsentDao,
  getAllAttendanceByFilterDao,
  getAppCloseEmployeeListDao,
  getEmployeeStartDayDao,
} from '../../dao/attendanceDao';
import {
  END_DAY,
  START_DAY,
  EMP_ON_LEAVE,
  NOT_IN_YET,
  ABSENT,
} from '../../utils/constants';
import { BadRequestError } from '../../utils/appErrors';
import getHistoryService from '../history/historyService';
import {
  addLiveTrackingDao,
  getLiveTrackingDao,
} from '../../dao/liveTrackingDao';
import { updateUserTrackingService } from '../userLiveTracking/userTrackingService';
import { addActivitiesDao } from '../../dao/leadActivitiesDao';
import { pushNotificationService } from '../notifications/notificationService';
import { sendPushNotification } from '../../middlewares/pushNotifications';
import { getFcmTokenDao } from '../../dao/notificationsDao';
import { uploadToAWS } from '../../utils/aws';

const logger = new Logger();
const loginNotificationService = async (title, body, start, dateformat) => {
  let conn;
  let notificationData;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const employeerole = await getEmployeeRolesIdDao(conn);
    for (const item of employeerole) {
      const data = await getUsersByRoleDao(conn, item.id);
      if (data !== undefined) {
        for (const key of data) {
          const token = {
            userId: key.id,
            companyId: key.company,
          };
          const startDate = await getStartDateDao(
            conn,
            start,
            dateformat,
            token.userId
          );
          if (startDate === undefined) {
            notificationData = await pushNotificationService(
              title,
              body,
              token
            );
          }
        }
      }
    }
    await conn.commit();
    return notificationData;
  } catch (error) {
    logger.log('error sending notification, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const logoutNotificationService = async (
  title,
  body,
  end,
  start,
  dateformat
) => {
  let conn;
  let notificationData;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const employeerole = await getEmployeeRolesIdDao(conn);
    for (const item of employeerole) {
      const data = await getUsersByRoleDao(conn, item.id);
      if (data !== undefined) {
        for (const key of data) {
          const token = {
            userId: key.id,
            companyId: key.company,
          };
          const startDate = await getStartDateDao(
            conn,
            start,
            dateformat,
            token.userId
          );
          if (startDate !== undefined) {
            const endDate = await getStartDateDao(
              conn,
              end,
              dateformat,
              token.userId
            );
            if (endDate === undefined) {
              notificationData = await pushNotificationService(
                title,
                body,
                token
              );
            }
          }
        }
      }
    }
    return notificationData;
  } catch (error) {
    logger.log('error sending notification, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const cronNotInYetService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const employeerole = await getEmployeeRolesIdDao(conn);
    for (const item of employeerole) {
      const data = await getUsersByRoleDao(conn, item.id);
      if (data !== undefined) {
        for (const key of data) {
          const token = {
            userId: key.id,
            companyId: key.company,
          };
          const { userId, companyId } = token;
          const event_type = NOT_IN_YET;
          const config = payload;
          await addActivitiesDao(conn, userId, companyId, config, event_type);
          await conn.commit();
        }
      }
    }
  } catch (error) {
    logger.log('error adding users, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const cronAbsentService = async (payload) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const employeerole = await getEmployeeRolesIdDao(conn);
    for (const item of employeerole) {
      const data = await getUsersByRoleDao(conn, item.id);
      if (data !== undefined) {
        for (const key of data) {
          const token = {
            userId: key.id,
            companyId: key.company,
          };
          const currentDate = new Date().toISOString().slice(0, 10);
          const checkEventAndDate = await checkEventType(
            conn,
            token,
            currentDate
          );
          const extractedDate = checkEventAndDate.created_at;
          const date = extractedDate.toISOString().slice(0, 10);
          if (date === currentDate) {
            await cronAbsentDao(conn, payload, token);
            await conn.commit();
          }
        }
      }
    }
  } catch (error) {
    logger.log('error adding users, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const cronEndDayService = async (payload) => {
  let conn;
  const date = new Date().toISOString().slice(0, 10);
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const employeerole = await getEmployeeRolesIdDao(conn);
    for (const item of employeerole) {
      const data = await getUsersByRoleDao(conn, item.id);
      if (data !== undefined) {
        for (const key of data) {
          const token = {
            userId: key.id,
            companyId: key.company,
          };
          const checkLeave = await checkLeaveDao(conn, date, token);
          if (!checkLeave || checkLeave === undefined) {
            const checkStartDay = await checkDayDao(conn, date, token);
            const isDayValues = checkStartDay.map((item2) => item2.is_day);
            if (isDayValues.includes('1')) {
              if (!isDayValues.includes('0')) {
                await endDayDao(conn, payload, token);
                await conn.commit();
              }
              return undefined;
              // eslint-disable-next-line no-else-return
            } else {
              const { userId, companyId } = token;
              const currentDate = new Date();
              const day = currentDate.getDate();
              const month = currentDate.getMonth() + 1; // Months are zero-based
              const year = currentDate.getFullYear();
              const formattedDay = String(day).padStart(2, '0');
              const formattedMonth = String(month).padStart(2, '0');
              const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
              key.date = formattedDate;
              key.is_leave = '1';
              const event_type = 'leave';
              const config = key;
              await addActivitiesDao(
                conn,
                userId,
                companyId,
                config,
                event_type
              );
              await conn.commit();
            }
          }
        }
      }
    }
  } catch (error) {
    logger.log('error adding end day, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
// revisit

const pauseService = async (token, images) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();

    let userSelfie;
    let meterImage;

    try {
      userSelfie = await uploadToAWS(images?.user_selfie[0]);
      meterImage = images.meter_image
        ? await uploadToAWS(images.meter_image[0])
        : null;
    } catch (error) {
      throw new BadRequestError('Upload failed:', error);
    }
    const files = {
      selfie_fileName: userSelfie?.imageUrl,
      meter_image_fileName: meterImage?.imageUrl,
    };
    return files;
  } catch (error) {
    logger.log('error in Upload, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const startDayService = async (payload, token, images, date) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();

    const userSelfie = await uploadToAWS(images?.user_selfie[0]);
    const meterImage = images.meter_image
      ? await uploadToAWS(images.meter_image[0])
      : null;

    const files = {
      selfie_fileName: userSelfie?.imageUrl,
      meter_image_fileName: meterImage?.imageUrl,
    };

    const config = {
      ...payload,
      files,
    };

    if (payload.is_flag === '1') {
      const checkLeave = await checkLeaveDao(conn, date, token);
      if (!checkLeave || checkLeave === undefined) {
        const checkStartDay = await checkDayDao(conn, date, token);

        const isDayValues = checkStartDay.map((item) => item.is_day);
        if (isDayValues.includes('0')) {
          throw new BadRequestError('Your day has already ended');
        }
        if (isDayValues.includes('1')) {
          const data = await getHistoryService(date, token);
          return data;
        }
        const data = await startDayDao(conn, config, token);
        const tracking_obj = {
          tracking_date: date,
          live_tracking: [
            {
              id: null,
              type: 1,
              marker_flag: 1,
              lat: config.lat,
              long: config.long,
              start_time: config.start_time,
              accuracy: 2.0,
            },
          ],
        };
        await addLiveTrackingDao(conn, token, tracking_obj);

        const payloadData = {
          token,
          id: data.id,
        };
        const data2 = await getUserActivitiesByIdDao(conn, payloadData);
        await conn.commit();
        return data2;
      }

      throw new BadRequestError('Already on leave');
    } else if (payload.is_flag === '0') {
      const checkLeave = await checkLeaveDao(conn, date, token);
      if (!checkLeave || checkLeave === undefined) {
        const checkStartDay = await checkDayDao(conn, date, token);
        const isDayValues = checkStartDay.map((item) => item.is_day);
        if (isDayValues.includes('0')) {
          throw new BadRequestError('Your day has already ended');
        }
        if (isDayValues.includes('1')) {
          const data = await endDayDao(conn, config, token);
          const getTracking = await getLiveTrackingDao(
            conn,
            token,
            token.userId,
            date
          );
          const { id } = getTracking[0];
          const tracking_obj = {
            live_tracking: [
              {
                id: null,
                type: 4,
                marker_flag: 1,
                lat: config.lat,
                long: config.long,
                start_time: config.start_time,
                accuracy: 2.0,
              },
            ],
          };
          await updateUserTrackingService(id, token, tracking_obj);
          const payload2 = {
            token,
            id: data.id,
          };
          const data2 = await getUserActivitiesByIdDao(conn, payload2);
          await conn.commit();
          return data2;
        }
        throw new BadRequestError("Day hasn't started yet");
      } else {
        throw new BadRequestError('Already on leave');
      }
    } else {
      throw new Error('attendance status not exists');
    }
  } catch (error) {
    logger.log('error in attendance, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getAttendanceService = async (date, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const checkLeave = await checkLeaveDao(conn, date, token);
    if (!checkLeave || checkLeave === undefined) {
      const data = await getAttendanceDao(conn, date, token);
      if (data?.is_start === `${START_DAY}`) {
        data.is_leave = 0;
        data.is_start = 1;
        return data;
      }
      if (!data || data === undefined) {
        return {
          is_leave: 0,
          is_start: 0,
          is_vehicle: 0,
        };
      }
    } else if (checkLeave?.is_leave === '1') {
      checkLeave.is_start = 0;
      checkLeave.is_vehicle = 0;
      checkLeave.is_leave = 1;
      return checkLeave;
    }
  } catch (err) {
    logger.log('error while getting attendance', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};
// add some validations
const addLeaveService = async (payload, token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const data = await addLeaveDao(conn, payload, token);
    await conn.commit();
    return data;
    // }
  } catch (error) {
    logger.log('error adding leave, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getAllAttendanceService = async (payload, token) => {
  let conn;
  let meter_sum;
  let activityData;
  const arr = [];
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();

    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);
    const currentDate = new Date(startDate);
    const offset = parseInt(payload.page - 1, 10) * parseInt(payload.limit, 10);
    const startDateformatted = currentDate.toISOString().slice(0, 10);
    const endDateFormatted = endDate.toISOString().slice(0, 10);
    if (payload.page && payload.limit) {
      activityData = await getAllAttendanceByFilterDao(
        conn,
        token.companyId,
        startDateformatted,
        endDateFormatted,
        payload,
        offset
      );
    } else {
      activityData = await getAllAttendanceDao(
        conn,
        token.companyId,
        startDateformatted,
        endDateFormatted
      );
    }
    if (!activityData) {
      throw new BadRequestError('User activity not found');
    } else {
      for (const activity of activityData.users) {
        const meterNo = parseFloat(activity.config.meter_no) || 0;
        if (activity.event_type === `${START_DAY}`) {
          const trackingData = await getTrackingDao(
            conn,
            token.companyId,
            activity.user_id,
            activity.date
          );
          let overallDistance = 0;
          const coordinates = trackingData[0]?.tracking || [];
          if (coordinates.length > 0) {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < coordinates.length - 1; i++) {
              const { lat: lat1, long: lon1 } = coordinates[i];
              const { lat: lat2, long: lon2 } = coordinates[i + 1];
              const distance = calculateDistance(lat1, lon1, lat2, lon2);
              overallDistance += distance;
            }
          }
          const newObject = { ...activity };
          newObject.date = activity.date;
          newObject.start_day_meter_no = activity.config.meter_no;
          newObject.map_distance = overallDistance;
          newObject.employee_status = 'present';
          arr.push(newObject);
          meter_sum = meterNo;
        }
        if (activity.event_type === `${EMP_ON_LEAVE}`) {
          const newObject = { ...activity };
          newObject.employee_status = 'leave';
          arr.push(newObject);
        } else if (activity.event_type === `${END_DAY}`) {
          for (const a of arr) {
            if (a.id === activity.employee_id && a.date === activity.date) {
              const meterDifference = meterNo - meter_sum;
              meter_sum = meterDifference < 0 ? 0 : meterDifference;
              const newObject = { ...activity };
              newObject.meter_sum = meter_sum;
              newObject.end_day_meter_no = meterNo;
              arr.push(newObject);
            }
          }
        } else if (activity.event_type === `${NOT_IN_YET}`) {
          const newObject = { ...activity };
          newObject.employee_status = 'not in yet';
          arr.push(newObject);
        } else if (activity.event_type === `${ABSENT}`) {
          const newObject = { ...activity };
          newObject.employee_status = 'absent';
          arr.push(newObject);
        }

        startDate.setDate(startDate.getDate() + 1);
      }
    }

    startDate.setDate(startDate.getDate() + 1);
    const attendanceList = arr;
    const { totalRowsValue } = activityData;
    await conn.commit();
    return { totalRowsValue, attendanceList };
  } catch (error) {
    logger.log('error getting attendance, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getListOfNotReceiveNotification = async (title, body) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const todayDate = new Date().toISOString().slice(0, 10);
    const data = await getEmployeeStartDayDao(conn, todayDate);
    if (data !== undefined) {
      const currentTime = new Date().toLocaleTimeString();
      const appcloseEmployee = await getAppCloseEmployeeListDao(
        conn,
        data,
        currentTime
      );
      if (appcloseEmployee !== undefined) {
        const fcmTokenData = await getFcmTokenDao(conn, appcloseEmployee);
        if (fcmTokenData !== undefined) {
          await sendPushNotification(fcmTokenData.fcmToken, title, body);
        }
      }
    }
    return data;
  } catch (err) {
    Logger.log('error while getting employeeList', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export {
  loginNotificationService,
  logoutNotificationService,
  startDayService,
  cronNotInYetService,
  cronAbsentService,
  getAttendanceService,
  addLeaveService,
  cronEndDayService,
  getAllAttendanceService,
  getListOfNotReceiveNotification,
  pauseService,
};
