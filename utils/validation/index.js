const { superstruct } = require('superstruct');
const Boom = require('boom');

const { handler } = require('../error');

exports.struct = superstruct({});

exports.formatMessage = error => {
  let errMessage = `${error.message}`;
  if (error.reason) errMessage += ` - ${error.reason}`;
  if (errMessage.length > 250) {
    errMessage = `${errMessage.slice(0, 150)} ... ${errMessage.slice(errMessage.length - 100, errMessage.length)}`;
  }
  return errMessage;
};

exports.validate = (schema, path) => (req, res, next) => {
  try {
    const Schema = exports.struct.partial(schema);

    let args;

    if (path) args = { ...req[path] };
    else args = { ...req.query, ...req.params, ...req.body };

    req.validData = {
      ...req.validData,
      ...Schema(args),
    };

    return next();
  } catch (e) {
    return handler(res, Boom.badRequest(exports.formatMessage(e)));
  }
};
