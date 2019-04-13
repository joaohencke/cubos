const fs = require('fs');
const path = require('path');
const Boom = require('boom');

let $data = [];

const fsPromise = fs.promises;

const reload = () => ($data = require('./persist/timeslot.json')); //eslint-disable-line

const persist = () => fsPromise.writeFile(path.join(__dirname, 'persist/timeslot.json'), JSON.stringify($data));

exports.find = ({ day, page, offset = 20 } = {}) => {
  reload();
  let data;
  if (day) data = $data.filter(x => x.day === day);
  else data = $data;

  if (page) data = data.slice(page * offset, (page + 1) * offset);

  return data;
};

exports.create = async ({ day, intervals, recurrence } = {}) => {
  const result = exports.find({ day });

  if (result.length)
    throw Boom.badRequest('Já existe intervalo para o dia informado. Exclua-o para então, inseri-lo novamente');

  $data.push({ day, intervals, recurrence });

  await persist();

  return $data[$data.length - 1];
};

exports.remove = async ({ day }) => {
  const result = exports.find({ day });

  if (!result.length) throw Boom.badRequest('Não existe intervalo para o dia cadastrado');

  const index = $data.findIndex(x => x.day === day);

  $data.splice(index, 1);

  await persist();

  return true;
};
