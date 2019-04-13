const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const helmet = require('helmet');

const docs = require('./_docs');
const config = require('./__config');
const apis = require('./_apis');
const { handler } = require('./utils/error');

const app = express();

app.use(helmet());
app.use(
  express.json({
    limit: '10mb',
    type: 'application/json',
  }),
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(docs)));

if (config.dev) {
  app.use(morgan('dev'));
}

Object.keys(apis).forEach(api => {
  app.use(`/api/${api}`, apis[api]);
});

// error handling
app.use((err, req, res, next) => handler(res, err));

app.listen(config.port, () => console.log(`express listening on port ${config.port}`));

module.exports = app;
