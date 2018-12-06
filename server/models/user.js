const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let UserSchema = new mongoose.Schema({
  email: {
    required: true,
    trim: true,
    type: String,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

// makes instance methods
// controls what the user will see when the data is returned. will not return a password... etc
UserSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
};

// we need 'this' keyword, so we're making this a called function instead of arrow
UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({ _id: user._id.toHexString(), access }, 'secret value').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

// this makes model methods
UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'secret value')
  } catch(e) {
    // return new Promise((res, rej) => {
    //   reject();
    // });

    // shortcut for returning a promise with err automatically
    return Promise.reject();
  };

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.statics.findByCredenials = function(email, password) {
  let User = this;
  return User.findOne({email})
    .then(user => {
      if (!user) {
        return Promise.reject()
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          res ? resolve(user) : reject()
        })
      })
    });
};

// mongoose middleware - automatically runs before we call the save funciton
UserSchema.pre('save', function (next) {
  let user = this;

  // checks to see if the password was at all modified
  if (user.isModified('password')) {
    // if it was changed by the user, we are changing the hash in the db
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
})

let User = mongoose.model('User', UserSchema);

module.exports = { User }
