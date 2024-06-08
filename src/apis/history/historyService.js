import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import calculateDistance from '../../middlewares/googleDistance';
import {
  getTrackingHistoryDao,
  getActivityHistoryDao,
  getOrderApprovedCountDao,
  getRevenueCountDao,
} from '../../dao/historyDao';

import {
  START_DAY,
  END_DAY,
  EMP_ON_LEAVE,
  EVENT_TYPE,
} from '../../utils/constants';

const logger = new Logger();

const getHistoryService = async (date, user, companyId) => {
  let conn;
  let leave = 0;
  let meter_sum = 0;
  let is_vehicle = 0;
  let checkEntry = 0;
  let endDayFound = false; // Flag to check if end day event is found
  try {
    conn = await db.fetchConn();
    let activityData = await getActivityHistoryDao(conn, date, user, companyId);
    let trackingData = await getTrackingHistoryDao(conn, date, user, companyId);
    const orderApproved = await getOrderApprovedCountDao(
      conn,
      date,
      user,
      companyId
    );
    const revenueCount = await getRevenueCountDao(conn, date, user, companyId);
    const numericValue = Number(orderApproved.row_count);
    for (const activity of activityData) {
      if (
        activity.event_type === `${START_DAY}` ||
        activity.event_type === `${END_DAY}`
      ) {
        const meterNo = parseFloat(activity.activity.meter_no);

        if (activity.event_type === `${START_DAY}`) {
          meter_sum = meterNo;
          checkEntry += 1;
          is_vehicle = parseFloat(activity.activity.is_vehicle);
        } else if (activity.event_type === `${END_DAY}`) {
          checkEntry += 1;
          const meterDifference = meterNo - meter_sum;
          meter_sum = meterDifference < 0 ? 0 : meterDifference;
          endDayFound = true;
        }
      }

      if (
        activity.event_type === EVENT_TYPE.minutes ||
        activity.event_type === EVENT_TYPE.kill
      ) {
        checkEntry += 1;
      }
      if (activity.event_type === `${EMP_ON_LEAVE}`) {
        leave = parseFloat(activity.activity.is_leave);
        activityData = [];
        trackingData = [];
      }
    }

    if (!endDayFound) {
      meter_sum = 0;
    }
    const count = activityData.length - checkEntry;

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

    const data = {
      is_leave: leave,
      total_count: count,
      orderApproved: numericValue || 0,
      revenueCount: revenueCount?.revenue_amount || 0,
      is_vehicle,
      google_distance: overallDistance,
      total_distance: meter_sum,
      activities: activityData,
      live_tracking: trackingData,
    };
    return data;
  } catch (err) {
    logger.log('error while getting history', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export default getHistoryService;
