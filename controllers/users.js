const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorFound = require('../errors/error-found');
const ErrorRequest = require('../errors/error-request');
const ErrorConflict = require('../errors/error-conflict');

const { NODE_ENV, JWT_SECRET } = process.env;

const getCurrentUser = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      res.send(err);
    })
    .catch(next);
};

const updateCurrentUser = (req, res, next) => {
  const id = req.user._id;
  const newName = req.body.name;
  const newEmail = req.body.email;

  User.findOneAndUpdate(
    { _id: id },
    {
      name: newName,
      email: newEmail,
    },
    {
      runValidators: true,
      new: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new ErrorFound('Нет пользователя с таким id.');
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ErrorRequest(err.message);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      throw new ErrorFound(err.message);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      res.status(200).send({
        name: user.name,
        _id: user._id,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ErrorRequest(err.message);
      }
      if (err.code === 11000) {
        throw new ErrorConflict('Пользователь с таким email уже существует.');
      }
    })
    .catch(next);
};

module.exports = {
  createUser,
  updateCurrentUser,
  getCurrentUser,
  login,
};
