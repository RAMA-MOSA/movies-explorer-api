const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateCurrentUser, getCurrentUser,
} = require('../controllers/users');

userRouter.get('/users/me',
  celebrate({
    params: Joi.object().keys({
      _id: Joi.string().length(24).hex(),
    }),
  }), getCurrentUser);

userRouter.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
    }),
  }), updateCurrentUser,
);

module.exports = userRouter;
