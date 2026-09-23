const { initFirebase } = require('./config/firebase');
const app = require('./app');

try {
  initFirebase();
  console.log('Firestore connected.');
} catch (err) {
  console.error('Failed to connect to Firestore:', err);
}

module.exports = app;