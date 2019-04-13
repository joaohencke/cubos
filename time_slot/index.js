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
        throw Boom.badRequest('O intervalo cadastrado conflita com algum horário cadastrado');
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

exports.create = async ({ day, intervals, recurrence } = {}) => {
  const result = exports.find({ day });

  if (result.length) {
    const [entity] = result;

    if (entity.recurrence !== recurrence)
      throw Boom.badRequest(
        'Já existe um intervalo cadastrado para o dia informado com recorrência diferente da atual',
      );

    checkTimeConflict(entity, intervals);

    entity.intervals.push(...intervals);
  } else {
    // need to check if time will conflict with recurrences instead of the day only

    $data.push({ day, intervals, recurrence });
  }
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
