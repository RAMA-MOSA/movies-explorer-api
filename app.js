require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');
const errorServer = require('./middlewares/errorServer');
const rateLimiter = require('./middlewares/rateLimit');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes/index');

const app = express();

const allowedCors = [
  'http://localhost:3001',
  'https://api.m-e.students.nomoredomains.monster',
  'https://m-e.students.nomoredomains.monster',
];

app.use(cors({
  origin: allowedCors,
}));

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/movies-explorer-db', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(helmet());

app.use(rateLimiter);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('/', routes);

app.use(errorLogger);

app.use(errors());

app.use(errorServer);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
