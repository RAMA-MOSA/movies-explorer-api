const Movie = require('../models/movie');
const ErrorFound = require('../errors/error-found');
const ErrorRequest = require('../errors/error-request');
const ErrorForbidden = require('../errors/error-forbidden');
const ErrorConflict = require('../errors/error-conflict');

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      if (!movies) {
        throw new ErrorFound('Фильм с таким id не найден.');
      }
      res.status(200).send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie.create({ owner, ...req.body })
    .then((movie) => {
      res.status(200).send({ data: movie });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ErrorRequest(err.message);
      } else if (err.code === 11000) {
        throw new ErrorConflict(err.message);
      }
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new ErrorFound('Фильм с таким id не найден.');
      }
      if (movie.owner.toString() !== owner) {
        throw new ErrorForbidden('Нельзя удалить чужой фильм.');
      } else {
        Movie.findByIdAndDelete(movieId)
          .then((deletedMovie) => {
            res.status(200).send({ data: deletedMovie });
          })
          .catch(next);
      }
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
