const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  };
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp')

  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('5c008509392f95263a23f6a2')
  // }, {
  //   $set: {
  //     completed: true
  //   }
  // }, {
  //   returnOriginal: false
  // })
  //   .then((result) => console.log(result))

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5c0078e2b0b1d212b5b4c9ec')
  }, {
    $set: { name: 'August' },
    $inc: { age: 1 }
  }, {
    returnOriginal: false
  }).then((result) => console.log(result))

  // client.close();
});
