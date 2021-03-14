const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const { errors } = require('celebrate');
const rateLimiter = require('./middlewares/rateLimit');
const routes = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const allowedCors = [
  'https://m-e.students.nomoredomains.monster',
  'https://api.m-e.students.nomoredomains.monster',
  'http://localhost:3001',
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

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  if (err.kind === 'ObjectId') {
    res.status(400).send({
      message: 'Неверно переданы данные',
    });
  } else {
    res.status(statusCode).send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка.'
        : message,
    });
  }
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
