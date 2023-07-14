export const errorHandler = (error, req, res, next) => {
  console.log('in errorHandler middleware, error: ', error.message);

  const status = error.statusCode || error.response?.status || 500;

  const { message, data } = error;

  res.status(status).json({ message, data });

  next();
};
