const express = require('express');

const router = express.Router({ mergeParams: true });

module.exports = router;

router.get('/', (req, res, next) => {});

router.get('/avaiable-between', (req, res, next) => {});
