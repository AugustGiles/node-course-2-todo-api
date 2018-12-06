const { ObjectID } = require('mongodb')
const { Todo } = require('../../models/todo')
const { User } = require('../../models/user')

const jwt = require('jsonwebtoken')

const todos = [{
  _id: new ObjectID(),
  text: 'First Test Todo'
}, {
  _id: new ObjectID(),
  text: 'Second Test Todo',
  completed: true,
  completedAt: 333,
}];

const user1ID = new ObjectID
const user2ID = new ObjectID
const users = [{
  _id: user1ID,
  email: 'august@example.com',
  password: 'user1pass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: user1ID, access: 'auth'}, 'secret value').toString()
  }]
}, {
  _id: user2ID,
  email: 'lauren@example.com',
  password: 'user2pass'
}];

// wipes all todos
// insertMany is a mongoose method, inserting docs into collection
// todos is coming from the todos variable above
const populateTodos = done => {
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
};

// wipes all users
// takes users made above and instantiates them - save() returns a promise!
// Promise.all waits for both of those promises to be resolved and returns another promise
const populateUsers = done => {
  User.remove({})
    .then(() => {
      user1 = new User(users[0]).save();
      user2 = new User(users[1]).save();
      return Promise.all([user1, user2])
    })
    .then(() => done());
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers,
}
