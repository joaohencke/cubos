const express = require('express');

const router = express.Router({ mergeParams: true });

module.exports = router;

router.post('/', (req, res, next) => { });

router.delete('/:date', (req, res, next) => { });