import Joi from 'joi';

const INSERT_ATTENDANCE_SCHEMA = Joi.object({
  is_vehicle: Joi.number().label('is_vehicle').required(),
  lat: Joi.number().label('lat').required(),
  long: Joi.number().label('long').required(),
  address: Joi.string().label('address').required(),
  locality: Joi.string().label('locality').required(),
  pincode: Joi.number().label('pincode').required(),
  is_flag: Joi.number().label('is_flag').required(),
  meter_no: Joi.string().label('meter_no').optional(),
  start_time: Joi.string().label('start_time').required(),
  employee_id: Joi.string().label('employee_id').optional(),
  employee_name: Joi.string().label('employee_name').optional(),
  public_office_distance: Joi.string()
    .label('public_office_distance')
    .optional(),
  images: Joi.object()
    .keys({
      user_selfie: Joi.array().label('user_selfie').required(),
      meter_image: Joi.array().label('meter_image').optional(),
    })
    .label('images')
    .required(),
});

const INSERT_LEAVE_SCHEMA = Joi.object({
  config: Joi.object()
    .keys({
      is_leave: Joi.number(),
      start_time: Joi.string(),
      public_office_distance: Joi.string(),
    })
    .label('config')
    .required(),
});

export { INSERT_ATTENDANCE_SCHEMA, INSERT_LEAVE_SCHEMA };
