const env = require('./config/env');
const { initFirebase } = require('./config/firebase');
const app = require('./app');

function start() {
  try {
    initFirebase();
    console.log('Firestore connected.');
  } catch (err) {
    console.error('Failed to connect to Firestore:', err.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port} [${env.nodeEnv}]`);
  });
}

start();
