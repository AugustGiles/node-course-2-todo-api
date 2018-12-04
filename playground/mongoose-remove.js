const { mongoose } = require('../server/db/mongoose')
const { Todo } = require('../server/models/todo')
const { User } = require('../server/models/user')

const { ObjectID } = require('mongodb')

// this is depricated
// Todo.remove({}).then((result) => {
//   console.log(result)
// })

// these remove and return the document removed
// Todo.findOneAndRemove({_id: '5c05e244d04d711991a7d065'}).then(todo => console.log(todo))

// Todo.findByIdAndRemove('5c05e244d04d711991a7d065').then(todo => console.log(todo))
