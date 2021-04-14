const movieRouter = require('express').Router();
const { celebrate, Joi, CelebrateError } = require('celebrate');

const isURL = require('validator/lib/isURL');

const urlValidator = (value) => {
  if (!isURL(value)) {
    throw new CelebrateError(`${value} не является URL адресом`);
  }
  return value;
};

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

movieRouter.get('/movies', getMovies);

movieRouter.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(urlValidator),
      trailer: Joi.string().required(),
      thumbnail: Joi.string().required().custom(urlValidator),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

movieRouter.delete(
  '/movies/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().required().hex().length(24),
    }),
  }),
  deleteMovie,
);

module.exports = movieRouter;
