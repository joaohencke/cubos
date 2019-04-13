module.exports = {
  dev: !['production', 'test'].includes(process.env.NODE_ENV),
  port: process.env.PORT || 8888,
};
