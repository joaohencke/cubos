const express = require('express');
const { validate, struct } = require('../../utils/validation');
const { create, remove } = require('../');

const router = express.Router({ mergeParams: true });

module.exports = router;

router.post(
  '/',
  validate(
    {
      day: 'slotDate',
      intervals: struct.list([struct.partial({ start: 'slotTime', end: 'slotTime' })]),
      recurrence: struct.enum(['none', 'daily', 'weekly']),
    },
    'body',
  ),
  (req, res, next) => {
    create(req.validData)
      .then(result => res.json(result))
      .catch(next);
  },
);

router.delete('/:day', validate({ day: 'slotDate' }, 'params'), (req, res, next) => {
  remove(req.validData)
    .then(result => res.json(result))
    .catch(next);
});
