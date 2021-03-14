const errorServer = (err, req, res, next) => {
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
  if (next) {
    next();
  }
};

module.exports = errorServer;
