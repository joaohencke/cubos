const express = require('express');
const morgan = require('morgan');
const config = require('./__config');

const app = express();

if (config.dev) {
  app.use(morgan('dev'));
}

app.listen(config.port, () => console.log(`express listening on port ${config.port}`));
