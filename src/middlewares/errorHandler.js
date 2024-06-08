import { HTTPError } from '../utils/appErrors';

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  const message = 'Server encountered a problem';
  let err = {
    message,
    statusCode,
  };

  if (error && error instanceof HTTPError) {
    statusCode = error.statusCode;
    err = {
      ...err,
      statusCode: error.statusCode,
      name: error.name,
      message: error.message,
    };
  } else if (error) {
    err = { ...error, message };
  }

  const finalRes = {};
  finalRes.error = { ...err };

  res.status(statusCode).json(finalRes);
};

export default errorHandler;
