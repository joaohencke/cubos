const fs = require('fs');
const path = require('path');
const Boom = require('boom');
const moment = require('moment');
const uuid = require('uuid');

let $data = [];

const fsPromise = fs.promises;

/**
 * Reload $data with json content
 */
const reload = () => ($data = require('./persist/timeslot.json')); //eslint-disable-line

/**
 * Persist the $data to file
 */
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
        throw Boom.badRequest(`Intervalo conflitante: ${stored.start} - ${stored.end}`);
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

  let result = $data.reduce((acc, { day, intervals, recurrence }) => {
    switch (recurrence) {
      case 'none':
        if (!moment(day, pattern).isBetween(startMoment, endMoment, null, '[]')) return acc;
        break;
      case 'daily':
      case 'weekly':
        if (moment(day, pattern).isSameOrBefore(endMoment)) {
          const dayMoment = moment(day, pattern);

          while (dayMoment.isSameOrBefore(endMoment)) {
            if (!acc[dayMoment.format(pattern)])
              acc[dayMoment.format(pattern)] = { day: dayMoment.format(pattern), intervals: [] };
            acc[dayMoment.format(pattern)].intervals.push(...intervals);

            dayMoment.add(1, recurrence === 'daily' ? 'day' : 'week');
          }
        }
        return acc;

      default:
        return acc;
    }

    if (!acc[day]) acc[day] = { day, intervals: [] };
    acc[day].intervals.push(...intervals);
    return acc;
  }, {});

  result = Object.values(result);

  if (page) result = result.slice(page * limit, (page + 1) * limit);

  return result;
};

/**
 * Create an interval for a date
 *
 * @returns {Promise<Object>}
 * @throws {BadRequest} if has time conflict
 */
exports.create = async ({ day, intervals, recurrence } = {}) => {
  const result = [...exports.find({ day }), ...exports.find({ recurrence: 'daily' })];

  for (let i = 0, l = result.length; i < l; i += 1) {
    const entity = result[i];
    checkTimeConflict({ storedIntervals: entity.intervals, toStoreIntervals: intervals });
  }

  const weeklyRecurrences = exports.find({ recurrence: 'weekly' });
  const pattern = 'DD-MM-YYYY';

  for (let i = 0, l = weeklyRecurrences.length; i < l; i += 1) {
    const entity = weeklyRecurrences[i];

    let datediff = moment(entity.day, pattern).diff(moment(day, pattern), 'days');

    if (datediff < 0) datediff *= -1;
    if (datediff % 7 === 0) checkTimeConflict({ storedIntervals: entity.intervals, toStoreIntervals: intervals });
  }

  $data.push({ id: uuid.v1(), day, intervals, recurrence });
  await persist();

  return $data[$data.length - 1];
};

/**
 * Removes intervals for a specific day
 *
 * @param {Object} { id }
 * @throws {BadRequest} if entity doesn't exists
 * @returns {Promise}
 */
exports.remove = async ({ id } = {}) => {
  reload();
  const index = $data.findIndex(x => x.id === id);

  if (index < 0) throw Boom.badRequest('O intervalo não existe');

  $data.splice(index, 1);

  await persist();

  return true;
};
