const mongoose = require('mongoose')

//  configures promises
mongoose.Promise = global.Promise;

// be sure to have mongo listening on port 27017 in the command line
// the /TodoApp is us naming the new local directory we're writing into. 0 config, just start writing to it
// connect to heroku env variable if it exists (if we're in production) and localhost if in dev
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = { mongoose }
