const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  };
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp')

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Eat Lunch'})
  //   .then((result) => console.log(result))

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Eat Lunch'})
  //   .then((result) => console.log(result))

  // findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false})
  //   .then((document) => console.log(document))

  // EXERCISES

  db.collection('Users').deleteMany({name: 'Kaleb'})
    .then((result) => console.log(result))

  db.collection('Users').findOneAndDelete({_id: new ObjectID('5c007aee54d87812baf3e47a')})
    .then((doc) => console.log(doc))

  // client.close();
});
