const fs = require('fs');
const path = require('path');
const Boom = require('boom');
const moment = require('moment');

let $data = [];

const fsPromise = fs.promises;

const reload = () => ($data = require('./persist/timeslot.json')); //eslint-disable-line

const persist = () => fsPromise.writeFile(path.join(__dirname, 'persist/timeslot.json'), JSON.stringify($data));

const checkTimeConflict = (entity, intervals) => {
  const pattern = 'HH:mm';
  for (let i = 0, l = entity.intervals.length; i < l; i += 1) {
    const stored = entity.intervals[i];
    for (let j = 0, m = intervals.length; j < m; j += 1) {
      const toInsert = intervals[j];
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
};

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

exports.create = async ({ day, intervals, recurrence } = {}) => {
  const result = exports.find({ day });

  if (result.length) {
    for (let i = 0, l = result.length; i < l; i += 1) {
      const entity = result[i];
      checkTimeConflict(entity, intervals);
    }
  }

  $data.push({ day, intervals, recurrence });
  await persist();

  return $data[$data.length - 1];
};

exports.remove = async ({ day } = {}) => {
  const result = exports.find({ day });

  if (!result.length) throw Boom.badRequest('Não existe intervalo para o dia cadastrado');

  const index = $data.findIndex(x => x.day === day);

  $data.splice(index, 1);

  await persist();

  return true;
};
