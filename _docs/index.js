module.exports = {
  definition: {
    info: {
      title: 'Cubos',
      version: '1.0.0',
      description: 'Gerenciamento de horários',
    },
    host: 'localhost:8888',
    basePath: '/api',
  },
  apis: ['*/router/*.read.js', '*/router/*.write.js'],
};
