const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const ErrorAuth = require('../errors/error-auth');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: (props) => `${props.value} - не email.`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
    validate: {
      validator(v) {
        return validator.isStrongPassword(v);
      },
      message: (props) => `${props.value} - не надежный пароль.`,
    },
  },
});

userSchema.statics.findUserByCredentials = function fn(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new ErrorAuth('Введены неправильные данные для входа.'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new ErrorAuth('Введены неправильные данные для входа.'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
