const express = require('express');
const { validate } = require('../../utils/validation');
const { find } = require('../');

const router = express.Router({ mergeParams: true });

module.exports = router;

router.get(
  '/',
  validate({ day: 'slotDate?', start: 'slotDate?', end: 'slotDate?', page: 'numeric?', offset: 'numeric?' }, 'query'),
  (req, res) => {
    res.json(find(req.validData));
  },
);
