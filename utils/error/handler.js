const Boom = require('boom');

/**
 * Http error handler
 *
 * @param {Object} res express response object
 * @param {Error} err error
 */
module.exports = (res, err) => {
  let error = Boom.isBoom(err) ? err : Boom.boomify(err);
  if (error.name === 'ValidationError') {
    error = Boom.boomify(error, {
      statusCode: 400,
    });
  }
  if (process.env.NODE_ENV !== 'test') console.trace(error);
  return res.status(error.output.statusCode).json({
    error: error.output.payload.error,
    message: error.message,
  });
};
