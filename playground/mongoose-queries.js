const { mongoose } = require('../server/db/mongoose')
const { Todo } = require('../server/models/todo')
const { User } = require('../server/models/user')
const { ObjectID } = require('mongodb')

let userId = '5c00a5fbc1365813da65aaa1'

User.findById(userId)
  .then(user => {
    if (!user) {
      console.log('Could not find that user')
    }
    console.log(user)
  })
  .catch(e => console.log(e.message))

// practice on using find methods on the models

let id = '5c01df8373c931165fe4fdb41'

// mongoose converts the id's into strings for us!
Todo.find({_id: id})
  .then(todos => console.log('Todos', todos))

Todo.findOne({_id: id})
  .then(todo => console.log('Todo', todo))

if (!ObjectID.isValid(id)) {
  console.log('ID is not valid')
}

Todo.findById(id)
  .then(todo => {
    if (!todo) {
      return console.log('ID not found')
    }
    console.log('Todo', todo)
  })
  .catch(e => console.log(e.message))
