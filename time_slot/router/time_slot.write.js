const express = require('express');
const controller = require('../');

const router = express.Router({ mergeParams: true });

module.exports = router;

router.post('/', (req, res, next) => {});

router.delete('/:date', (req, res, next) => {});
