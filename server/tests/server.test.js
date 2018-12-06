const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');


const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user')
const { todos, populateTodos, users, populateUsers } = require('./seed/seed')


// beforeEach is a lifecycle method that is called before each test.
// in this case, it's helping to configure database expectations for the tests.
// we can make the db consistent for testing purposes
beforeEach(populateUsers);
beforeEach(populateTodos);

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
          .then((todos) => {
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

describe('GET /users/me', () => {

  it('Should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('Should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({})
      })
      .end(done);
  });

});

describe('POST /users', () => {

  it('Should create a user', (done) => {
    let email = 'example@example.com';
    let password = '123123';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body.email).toBe(email);
        expect(res.body._id).toBeTruthy();
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email})
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('Should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123',
      })
      .expect(400)
      .end(done);
  });

  it('Should not create user if email is in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password:'123123'
      })
      .expect(400)
      .end(done);
  });

});

describe('POST /users/login', () => {

  it('Should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        };
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toHaveProperty('access', 'auth')
            expect(user.tokens[0]).toHaveProperty('token', user.tokens[0].token)
            done()
          })
          .catch(e => done(e));
      })
  })

  it('Should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: '123123123'
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        };
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  })

})


// N O T E S   F O R   P A C K A G E . J S O N   T E S T
// down in test and test-watch - those are custom scripts so if I run
// the key in the command line, it will run the value. Shortcuts!!! Yay!!
// $ npm run test-watch
