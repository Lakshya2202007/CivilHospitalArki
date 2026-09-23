const app = require('./server');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port} [${env.nodeEnv}]`);
});