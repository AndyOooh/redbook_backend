// export const errorCreator = (message, statusCode) => {
//   console.log('in errorCreator');
//   return (req, res, next) => {
//     console.log('in errorCreator req', message);
//     const error = new Error(message);
//     error.status = statusCode;
//     if (async) {
//       console.log('in errorCreator async');
//       return next(error);
//     }
//     throw error;
//     // async ? return next (error) : throw error;
//   };
// };

export const errorCreator = async (message, statusCode) => {
  console.log('in errC');
  return function (req, res, next) {

    console.log('req', req);
    console.log('in errC req', message);
    return 2
    // next();
  };
};

// export const errorCreator = async (message, statusCode) => {
//   console.log('in errorCreator 11111: ', message);
//   return (req, res, next) => {
//     console.log('in errorCreator 22222: ', message);
//     next();
//   };
// };
