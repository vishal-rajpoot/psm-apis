import Joi from 'joi';

const INSERT_USER_ACTIVITIY = Joi.object({
  event_type: Joi.string().label('event_type').required(),
  config: Joi.object().label('Config').optional(),
});

const UPDATE_ORDER_STATUS = Joi.object({
  id: Joi.string().uuid().label('User Id').required(),
  status: Joi.string().label('status').required(),
  token: Joi.object().label('token').required(),
  event_type: Joi.string().label('event_type').required(),
  reason: Joi.string().label('event_type').optional(),
});

const UPDATE_USER_ACTIVITIY = Joi.object({
  id: Joi.string().uuid().label('User Id').required(),
  config: Joi.object().label('Config').required(),
});

const CONFIRNM_ORDER_STATUS = Joi.object({
  id: Joi.string().uuid().label('User Id').required(),
  token: Joi.object().keys().label('token').required(),
});

export {
  INSERT_USER_ACTIVITIY,
  UPDATE_ORDER_STATUS,
  UPDATE_USER_ACTIVITIY,
  CONFIRNM_ORDER_STATUS,
};
