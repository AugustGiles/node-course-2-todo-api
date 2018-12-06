require('./config/config')

// local imports
const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { authenticate } = require('./middleware/authenticate')

// third party imports
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

// starts the express app
let app = express();

const port = process.env.PORT;

// setting up middleware. we can now send json to our express app
app.use(bodyParser.json())

// sets route for post request
app.post('/todos', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })
  todo.save()
    .then(doc => res.send(doc))
    .catch(e => res.status(400).send(e))
})

app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id})
    .then(todos => res.send({todos}))
    .catch(e => res.status(400).send(e))
})

// todo with id parameter
app.get('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  };

  Todo.findOne({_id: id, _creator: req.user.id})
    .then(todo => {
      !todo ? res.status(404).send() : res.send({todo});
    })
    .catch(e => res.status(400).send());
});

app.delete('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  };

  Todo.findOneAndRemove({_id: id, _creator: req.user._id})
    .then(todo => {
      !todo ? res.status(404).send() : res.status(200).send({todo});
    })
    .catch(e => res.status(400).send());
});

app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  // from lodash library - this only allows manipulation of those two fields
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  };

  if (_.isBoolean(body.completed) && body.completed) {
    // getTime() returns a js timestamp
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, { $set: body }, { new: true })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      };
      res.send({todo});
    })
    .catch(e => res.status(400).send()) ;
})

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password'])
  let user = new User(body)
  user.save()
    .then(() => {
      return user.generateAuthToken()
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(e => res.status(400).send(e))
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password'])
  User.findByCredenials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken()
        .then(token => res.header('x-auth', token).send(user))
    })
    .catch(e => res.status(400).send());
})

// logs the user out - removing the token
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token)
    .then(() => {
      res.status(200).send()
    })
    .catch(() => res.status(400).send())
})

app.listen(port, () => console.log(`Started on Port ${port}`));

module.exports = { app };
