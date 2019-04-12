const express = require('express');
const morgan = require('morgan');
const config = require('./__config');
const apis = require('./_apis');

const app = express();

if (config.dev) {
  app.use(morgan('dev'));
}

Object.keys(apis).forEach(api => {
  app.use(`/api/${api}`, apis[api]);
});

app.listen(config.port, () => console.log(`express listening on port ${config.port}`));
