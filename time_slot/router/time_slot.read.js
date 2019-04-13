const express = require('express');
const { validate, struct } = require('../../utils/validation');
const { find } = require('../');

const router = express.Router({ mergeParams: true });

module.exports = router;

router.get(
  '/',

  validate({ day: 'slotDate?', page: 'numeric?', offset: 'numeric?' }, 'query'),
  (req, res) => {
    res.json(find(req.validData));
  },
);

router.get(
  '/avaiable-between',
  validate({ days: struct.optional(struct.list(['string'])) }, 'query'),
  (req, res, next) => {},
);
