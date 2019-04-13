const fs = require('fs');
const path = require('path');
const Boom = require('boom');
const moment = require('moment');
const uuid = require('uuid');

let $data = [];

const fsPromise = fs.promises;

const reload = () => ($data = require('./persist/timeslot.json')); //eslint-disable-line

const persist = () => fsPromise.writeFile(path.join(__dirname, 'persist/timeslot.json'), JSON.stringify($data));

/**
 *
 * Check if has time conflict between stored intervals and to store intervals
 *
 * @param {Object} { storedIntervals, toStoreIntervals }
 * @throws {BadRequest} if has time conflict
 */
function checkTimeConflict({ storedIntervals, toStoreIntervals }) {
  const pattern = 'HH:mm';
  for (let i = 0, l = storedIntervals.length; i < l; i += 1) {
    const stored = storedIntervals[i];
    for (let j = 0, m = toStoreIntervals.length; j < m; j += 1) {
      const toInsert = toStoreIntervals[j];
      if (
        moment(toInsert.start, pattern).isBetween(
          moment(stored.start, pattern),
          moment(stored.end, pattern),
          null,
          '[]',
        ) ||
        moment(toInsert.end, pattern).isBetween(moment(stored.start, pattern), moment(stored.end, pattern), null, '[]')
      ) {
        throw Boom.badRequest('O intervalo conflita com algum horário cadastrado');
      }
    }
  }
}

/**
 * Returns stored entities and filter when it needs
 * @param {Object} { day, recurrence, start, end, page, limit }
 * @returns {Array}
 */
exports.find = ({ day, recurrence, start, end, page, limit = 20 } = {}) => {
  reload();
  let data = $data;

  if (start && end) {
    const pattern = 'DD-MM-YYYY';
    const startMoment = moment(start, pattern);
    const endMoment = moment(end, pattern);

    data = data.filter(x => moment(x.day, pattern).isBetween(startMoment, endMoment, null, '[]'));
  }

  if (recurrence) data = data.filter(x => x.recurrence === recurrence);

  if (day) data = data.filter(x => x.day === day);

  if (page) data = data.slice(page * limit, (page + 1) * limit);

  return data;
};

/**
 * Returns avaiables intervals between dates
 *
 * @param {Object} {start, end, page, limit}
 * @returns {Array}
 */
exports.avaiables = ({ start, end, page, limit = 20 }) => {
  reload();
  const pattern = 'DD-MM-YYYY';
  const startMoment = moment(start, pattern);
  const endMoment = moment(end, pattern);

  let result = $data.reduce((acc, { day, intervals }) => {
    if (!moment(day, pattern).isBetween(startMoment, endMoment, null, '[]')) return acc;

    if (!acc[day]) acc[day] = { day, intervals: [] };
    acc[day].intervals.push(...intervals);
    return acc;
  }, {});

  if (page) result = result.slice(page * limit, (page + 1) * limit);

  return Object.values(result);
};

/**
 * Create an interval for a date
 *
 * @returns {Promise<Object>}
 * @throws {BadRequest} if has time conflict
 */
exports.create = async ({ day, intervals, recurrence } = {}) => {
  const result = exports.find({ day });

  if (result.length) {
    for (let i = 0, l = result.length; i < l; i += 1) {
      const entity = result[i];
      checkTimeConflict({ storedIntervals: entity.intervals, toStoreIntervals: intervals });
    }
  }

  $data.push({ id: uuid.v1(), day, intervals, recurrence });
  await persist();

  return $data[$data.length - 1];
};

/**
 * Removes intervals for a specific day
 */
exports.remove = async ({ id } = {}) => {
  reload();
  const index = $data.findIndex(x => x.id === id);

  if (index < 0) throw Boom.badRequest('O intervalo não existe');

  $data.splice(index, 1);

  await persist();

  return true;
};
