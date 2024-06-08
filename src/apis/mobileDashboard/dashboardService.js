import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import { getOrderDetailsDao } from '../../dao/mobileDashboardDao';
import { addMeeting } from '../meeting/meetingController';

const logger = new Logger();

const getOrderDetailService = async (token) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const { orderCount, meetingData } = await getOrderDetailsDao(conn, token);
    let orderData;
    if (orderCount && orderCount[0].order_count !== undefined) {
      orderData = {
        order_count: orderCount[0].order_count.toString(),
        total_order_value: orderCount[0].total_order_value,
        meetingCount: meetingData.meetingCount ? meetingData.meetingCount : 0
      };
    }
    return orderData;
  } catch (err) {
    logger.log('error while getting order details', 'error', err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

export default getOrderDetailService;
