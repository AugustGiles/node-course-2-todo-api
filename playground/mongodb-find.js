// const MongoClient = require('mongodb').MongoClient
const {MongoClient, ObjectID} = require('mongodb');

// connect to db
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  };
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp')

  // db.collection('Todos').find().count()
  //   .then((count) => {
  //     console.log(`Todos count: ${count}`)
  //   })
  //   .catch((e) => console.log('Unable to fetch Todos', e))

  db.collection('Users').find({name: 'August'}).toArray()
    .then((user) => console.log(JSON.stringify(user, undefined, 2));)
    .catch((e) => console.log('Unable to fetch User', e))

  // client.close();
});
