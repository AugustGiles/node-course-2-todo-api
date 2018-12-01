const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const { Todo } = require('../models/todo');

let todos = [{
  text: 'First Test Todo'
}, {
  text: 'Second Test Todo'
}];

// beforeEach is a lifecycle method that is obviously called before each test.
// in this case, it's helping to configure database expectations for the tests.
// we can make the db consistent for testing purposes
beforeEach(done => {
  // wipes all todos
  Todo.remove({})
    .then(() => {
      // insertMany is a mongoose method, inserting docs into collection
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text})
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      })
  })
})

describe('GET /todos', () => {
  it('Should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
})

// N O T E S   F O R   P A C K A G E . J S O N   T E S T
// down in test and test-watch - those are custom scripts so if I run
// the key in the command line, it will run the value. Shortcuts!!! Yay!!
// $ npm run test-watch
