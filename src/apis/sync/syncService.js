import * as db from '../../utils/db';
import Logger from '../../utils/logger';
import {
  addLiveTrackingDao,
  getLiveTrackingDao,
} from '../../dao/liveTrackingDao';
import { updateUserTrackingService } from '../userLiveTracking/userTrackingService';
import { addLeadDao } from '../../dao/leadsDao';
import { getAttendanceService } from '../attendance/attendanceService';
import {
  addUserActivitiesDao,
  addLeadActivitiesDao,
  getLeadsBytempIdDao,
  addFarmerMiscResoureEntriesDao,
  excuteMeeting,
} from '../../dao/syncDao';
import { EVENT_TYPE } from '../../utils/constants';
import { getApprovalDao } from '../../dao/featureApprovalDao';
import { confirmOrderStatusService } from '../userActivities/userActivitiesService';
import { approveLeadService, transferLeadService } from '../leads/leadsService';
import { getRoleByNameDao } from '../../dao/rolesDao';
import { getUserByIdDao } from '../../dao/userDao';
import { uploadToAWSbase64 } from '../../utils/aws';

const logger = new Logger();

const postSyncService = async (req, payload) => {
  let conn;
  const dateformate = new Date().toISOString().slice(0, 10);

  try {
    conn = await db.fetchConn();
    const getAttendance = await getAttendanceService(dateformate, req.user);
    if (getAttendance.is_start === 1) {
      if (payload?.user_tracking.length > 0) {
        for (const syncdata of payload.user_tracking) {
          if (syncdata.type === EVENT_TYPE.new_lead) {
            for (const leads of syncdata.data) {
              const lead = {
                first_name: leads.first_name,
                last_name: leads.last_name,
                contact_no: leads.mobile_no,
                designation_id: leads.buyer_designation_id,
                config: { buyer_id: leads.id, company: leads.company_name },
              };

              const leadData = {
                body: lead,
                user: req.user,
              };
              const addlead = await addLeadDao(conn, leadData);
              if (addlead.id !== undefined) {
                const leadId = addlead.id;
                const token = req.user;
                const getName = await getUserByIdDao(
                  conn,
                  req.user.companyId,
                  req.user.userId
                );
                const employeeName = `${getName[0].first_name} ${getName[0].last_name}`;
                const user = {
                  employee_id: req.user.userId,
                  employee: employeeName,
                };
                await transferLeadService(leadId, user, token);

                const vendor = 'vendor';
                const data2 = await getRoleByNameDao(conn, token, vendor);
                const role_id = data2.id;

                const getStatus = await getApprovalDao(
                  conn,
                  req.user.companyId
                );
                for (const vendors of getStatus) {
                  if (vendor.designation_id === leads.buyer_designation_id) {
                    if (vendors.config.length > 0) {
                      for (const item of vendors.config) {
                        if (item.feature === 'Lead Approval') {
                          if (item.status === 'Active') {
                            await approveLeadService(leadId, token, role_id);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.lead_order) {
            const eventType = EVENT_TYPE.lead_order;
            for (const leads of syncdata.data) {
              const getId = await getLeadsBytempIdDao(conn, leads.buyer_id);
              const { id } = getId;
              if (id) {
                await addLeadActivitiesDao(conn, id, req, leads, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.lead_discussion) {
            const eventType = EVENT_TYPE.lead_discussion;
            for (const leads of syncdata.data) {
              const getId = await getLeadsBytempIdDao(conn, leads.buyer_id);
              const { id } = getId;
              if (id) {
                await addLeadActivitiesDao(conn, id, req, leads, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.lead_reminder) {
            const eventType = EVENT_TYPE.lead_reminder;
            for (const leads of syncdata.data) {
              const getId = await getLeadsBytempIdDao(conn, leads.buyer_id);
              const { id } = getId;
              if (id) {
                await addLeadActivitiesDao(conn, id, req, leads, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.minutes) {
            const eventType = EVENT_TYPE.minutes;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.kill) {
            const eventType = EVENT_TYPE.kill;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.Pause) {
            const eventType = EVENT_TYPE.Pause;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.order) {
            const eventType = EVENT_TYPE.order;
            for (const user of syncdata.data) {
              const data = await addUserActivitiesDao(
                conn,
                req,
                user,
                eventType
              );
              const payloadData = {
                token: req.user,
                id: data.id,
              };

              const data2 = await getApprovalDao(conn, req.user.companyId);
              for (const vendor of data2) {
                if (vendor.designation_id === user.buyer_designation_id) {
                  if (vendor.config.length > 0) {
                    for (const item of vendor.config) {
                      if (item.feature === 'Order Approval') {
                        if (item.status === 'Active') {
                          await confirmOrderStatusService(payloadData);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.discussion) {
            const eventType = EVENT_TYPE.discussion;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.reminder) {
            const eventType = EVENT_TYPE.reminder;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.checkIn) {
            const eventType = EVENT_TYPE.checkIn;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }

          if (syncdata.type === EVENT_TYPE.dealer) {
            const eventType = EVENT_TYPE.dealer;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.payment) {
            const eventType = EVENT_TYPE.payment;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.checkout) {
            const eventType = EVENT_TYPE.checkout;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.meeting) {
            const eventType = EVENT_TYPE.meeting;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }

          if (syncdata.type === EVENT_TYPE.farmer) {
            const eventType = EVENT_TYPE.farmer;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.CompetitorStock) {
            const eventType = EVENT_TYPE.CompetitorStock;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.OwnStock) {
            const eventType = EVENT_TYPE.OwnStock;
            for (const user of syncdata.data) {
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.meeting_newparty_cosntact) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.meeting_newparty_cosntact;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.meeting_distributor_meet) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.meeting_distributor_meet;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.organized_farmer_meeting) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.organized_farmer_meeting;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.spot_farmer_meetting) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.spot_farmer_meetting;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.individual_farmer_connect) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.individual_farmer_connect;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.demo_conducted) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.demo_conducted;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.field_day) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.field_day;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
          if (syncdata.type === EVENT_TYPE.newfarmer) {
            const eventType = EVENT_TYPE.newfarmer;
            for (const user of syncdata.data) {
              const farmerId = await addFarmerMiscResoureEntriesDao(
                conn,
                req,
                user
              );
              user.farmerId = farmerId;
              await addUserActivitiesDao(conn, req, user, eventType);
            }
          }
          if (syncdata.type === EVENT_TYPE.meeting_other) {
            if (syncdata.scheduleId && syncdata.scheduleId !== null) {
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                await excuteMeeting(conn, req, syncdata.scheduleId, user);
              }
            } else {
              const eventType = EVENT_TYPE.meeting_other;
              for (const user of syncdata.data) {
                if (user.farmer) {
                  const farmerIds = [];
                  for (const farmerData of user.farmer) {
                    const farmerId = await addFarmerMiscResoureEntriesDao(
                      conn,
                      req,
                      farmerData
                    );
                    farmerIds.push(farmerId);
                  }
                  user.farmerIds = farmerIds;
                }
                if (user.image) {
                  for (const meetingImage of user.image) {
                    if (meetingImage.image) {
                      const imageUrl = await uploadToAWSbase64(
                        meetingImage?.image
                      );
                      user.imageUrl = imageUrl?.imageUrl;
                      delete meetingImage.image;
                    }
                  }
                }
                user.is_execute = '1';
                await addUserActivitiesDao(conn, req, user, eventType);
              }
            }
          }
        }
      }
    }
    if (payload?.live_tracking.length > 0) {
      const token = req.user;
      const { userId } = req.user;
      const trackingData = {
        tracking_date: dateformate,
        live_tracking: payload?.live_tracking,
      };
      const getData = await getLiveTrackingDao(
        conn,
        token,
        userId,
        dateformate
      );
      if (getData.length > 0) {
        const { id } = getData[0];
        await updateUserTrackingService(id, token, payload);
      } else {
        await addLiveTrackingDao(conn, token, trackingData);
      }
    }
    return {};
  } catch (error) {
    logger.log('error while adding sync Object', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export default postSyncService;
