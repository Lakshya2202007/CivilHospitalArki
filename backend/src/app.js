const path = require('path');
const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: env.clientUrl === '*' ? true : env.clientUrl.split(',') }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploaded plan documents, notice attachments and banner images.
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Civil Hospital Arki API is running.' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
