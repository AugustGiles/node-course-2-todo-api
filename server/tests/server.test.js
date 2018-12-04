const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');


let todos = [{
  _id: new ObjectID(),
  text: 'First Test Todo'
}, {
  _id: new ObjectID(),
  text: 'Second Test Todo',
  completed: true,
  completedAt: 333,
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

describe('GET /todos/:id', () => {
  it('Should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('Should return a 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID()}`)
      .expect(404)
      .end(done);
  });

  it('Should return a 404 if object id is invalid', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
})

describe('DELETE /todos/:id', () => {
  it('Should remove a todo', (done) => {
    let id = todos[1]._id.toHexString()
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        };

        Todo.findById(id)
          .then((todo) => {
            expect(todo).toNotExist;
            done();
          })
          .catch(e => done(e))
      })
  })

  it('Should return a 404 if todo not found', (done) => {
       request(app)
        .delete(`/todos/${new ObjectID()}`)
        .expect(404)
        .end(done);
  })

  it('Should return a 404 if object id is invalid', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  })
})

describe('PATCH /todos/:id', () => {

  it('Should update the todo', (done) => {
    let id = todos[0]._id
    let text = "updated text"

    request(app)
      .patch(`/todos/${id}`)
      .send({text, completed: true})
      .expect(200)
      .expect(res => {
        console.log(res)
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(true)
        expect(typeof res.body.todo.completedAt).toBe('number')
      })
      .end(done);
  });

  it('Should clear completed at when todo is not completed', (done) => {
    let id = todos[1]._id.toHexString()
    let text = 'more new text'

    request(app)
      .patch(`/todos/${id}`)
      .send({text, completed: false})
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })

      .end(done);
  });
});

// N O T E S   F O R   P A C K A G E . J S O N   T E S T
// down in test and test-watch - those are custom scripts so if I run
// the key in the command line, it will run the value. Shortcuts!!! Yay!!
// $ npm run test-watch
