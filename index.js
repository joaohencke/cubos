const express = require('express');
const morgan = require('morgan');
const config = require('./__config');
const apis = require('./_apis');
const { handler } = require('./utils/error');

const app = express();

app.use(
  express.json({
    limit: '10mb',
    type: 'application/json',
  }),
);

if (config.dev) {
  app.use(morgan('dev'));
}

Object.keys(apis).forEach(api => {
  app.use(`/api/${api}`, apis[api]);
});

// error handling
app.use((err, req, res, next) => handler(res, err));

app.listen(config.port, () => console.log(`express listening on port ${config.port}`));
