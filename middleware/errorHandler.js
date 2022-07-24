export const errorHandler = (err, req, res, next) => {
  console.log('in errorHandler middleware, error: ', err);

  const status = err.status || err.response?.status || 500;

  const { message, data } = err;

  res.status(status).json({ message, data });

  next();
};
