const AUTH_HEADER_KEY = 'x-auth-token';
const ACTIVE = 'Active';
const IN_ACTIVE = 'Inactive';
const PENDING = 'Pending';
const FALSE = false;
const LOGOUT = 'Logout';
const LOGIN = 'Login';
const START_DAY = 'start_Day';
const NOT_IN_YET = 'not_in_yet';
const ABSENT = 'absent';
const END_DAY = 'end_day';
const NEW = 'New';
const REJECTED = 'Rejected';
const PASSWORD = '12345678';
const APPROVED = 'Approved';
const CRONJOB_TIME = '50 23 * * * ';
const CRONJOB_22_MIN = '*/22 * * * *';
const CRON_START_DAY = '0 10 * * *';
const CRON_END_DAY = '0 20 * * *';
const CRON_REMINDER_DAY = '0 */3 * * *';
const CRON_NOT_IN_YET = '01 00 * * *';
const CRON_ABSENT = '59 23 * * *';
const ROLE_TYPE = {
  EMPLOYEE: 'employee',
  VENDOR: 'vendor',
};
const empProductConfig = {
  product_ids: [],
};

const EVENT_TYPE = {
  new_lead: 'new_lead',
  lead_order: 'lead_order',
  lead_reminder: 'lead_reminder',
  lead_discussion: 'lead_discussion',
  order: 'order',
  discussion: 'discussion',
  minutes: '15min',
  reminder: 'reminder',
  checkIn: 'check_in',
  kill: 'kill',
  meeting: 'meeting',
  payment: 'payment',
  checkout: 'check_out',
  CompetitorStock: 'competitor_stock',
  OwnStock: 'own_stock',
  Pause: 'pause',
  farmer: 'farmer',
  meeting_distributor_meet: 'meeting_distributor_meet',
  meeting_newparty_cosntact: 'meeting_newparty_cosntact',
  organized_farmer_meeting: 'organized_farmer_meeting',
  spot_farmer_meetting: 'spot_farmer_meetting',
  individual_farmer_connect: 'individual_farmer_connect',
  demo_conducted: 'demo_conducted',
  field_day: 'field_day',
  newfarmer: 'newFarmer',
  meeting_other: 'meeting_other',
  dealer: 'dealer',
};

const designation = {
  admin: 'admin',
  NH: 'NH' || 'National Head',
};

const source_name = {
  web: 'web',
  mobile: 'mobile',
};

const role_name = {
  admin: 'admin',
  employee: 'employee',
  vendor: 'vendor',
};

const DiscountBased = {
  product: 'Product Based',
  vendor: 'Vendor Based',
  unit: 'Unit Based',
};
const DiscountType = {
  hsn: 'SKU/HSN code',
  product: 'Products',
};

const STATUS = {
  ACTIVE: 'Active',
  IN_ACTIVE: 'Inactive',
  NEW: 'New',
  PENDING: 'Pending',
};

const VALIDATION_MESSAGES = {
  DUPLICATE: 'with same name exists',
  NOT_ALLOWED: 'is not allowed',
  DUPLICATE_MOBILE: 'with same mobile number exists',
};

const SUCCESSFULL_MESSAGE = ' created successfully';

const NOT_FOUND_MESSAGE = 'not found';
const EMP_ON_LEAVE = 'leave';

const BOOLEAN = {
  TRUE: true,
  FALSE: false,
};

const UPLOAD_FOLDER = '/assets/day_deatils_uploads/';

export {
  AUTH_HEADER_KEY,
  ACTIVE,
  IN_ACTIVE,
  PENDING,
  FALSE,
  LOGOUT,
  START_DAY,
  END_DAY,
  NEW,
  REJECTED,
  PASSWORD,
  APPROVED,
  CRONJOB_TIME,
  CRONJOB_22_MIN,
  CRON_END_DAY,
  CRON_REMINDER_DAY,
  CRON_START_DAY,
  CRON_NOT_IN_YET,
  EVENT_TYPE,
  NOT_IN_YET,
  ABSENT,
  CRON_ABSENT,
  ROLE_TYPE,
  empProductConfig,
  STATUS,
  VALIDATION_MESSAGES,
  SUCCESSFULL_MESSAGE,
  NOT_FOUND_MESSAGE,
  BOOLEAN,
  role_name,
  EMP_ON_LEAVE,
  LOGIN,
  UPLOAD_FOLDER,
  DiscountBased,
  DiscountType,
  designation,
  source_name,
};
