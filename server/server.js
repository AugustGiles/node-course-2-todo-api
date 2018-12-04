// local imports
const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')

// third party imports
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

// starts the express app
let app = express();

// sets up the port env variable for deployment || stays on 3000 for dev
const port = process.env.PORT || 3000;

// setting up middleware. we can now send json to our express app
app.use(bodyParser.json())

// sets route for post request
app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  })
  todo.save()
    .then(doc => res.send(doc))
    .catch(e => res.status(400).send(e))
})

app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => res.send({todos}))
    .catch(e => res.status(400).send(e))
})

// todo with id parameter
app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  };

  Todo.findById(id)
    .then(todo => {
      !todo ? res.status(404).send() : res.send({todo});
    })
    .catch(e => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  };

  Todo.findByIdAndRemove(id)
    .then(todo => {
      !todo ? res.status(404).send() : res.status(200).send({todo});
    })
    .catch(e => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
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

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send;
      };
      res.send({todo});
    })
    .catch(e => res.status(400).send()) ;

})

app.listen(port, () => console.log(`Started on Port ${port}`));

module.exports = { app };
