import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import db from '../src/db.js'

// test.beforeEach spustí callback před každým testem
test.beforeEach(async () => {
	// Před každým testem spustíme migrace
  await db.migrate.latest()
})

// test.afterEach spustí callback po každém testu
test.afterEach(async () => {
	// Po každém testu migrace rollbackneme
	// a databázi tak uklidíme pro použití v dalším testu.
	// Aby toto fungovalo je třeba mít implementované down funkce v migracích.
  await db.migrate.rollback()
})

test.after.always('cleanup', async () => {
  await db.destroy();
});

test.serial('GET / lists todos', async (t) => {
  const title = 'Testovací todo!!!';

  await db('todos').insert({ title });

  const response = await supertest(app).get('/');

  t.assert(response.text.includes(title), 'response does not include ToDo text');
});

test.serial('Toggle todo', async (t) => {
  const todo = await db('todos').insert({ title: 'Toggle Test' }).returning('*');
  const initialDoneStatus = todo[0].done;

  await supertest(app).get(`/toggle-todo/${todo[0].id}`);
  const updatedTodo = await db('todos').where('id', todo[0].id).first();

  t.not(initialDoneStatus, updatedTodo.done, 'Todo done status should be toggled');
});

test.serial('Update todo', async (t) => {
  const todo = await db('todos').insert({ title: 'Original Title' }).returning('*');
  const newTitle = 'Updated Title';
  const newPriority = 'high';

  await supertest(app)
    .post(`/update-todo/${todo[0].id}`)
    .send(`title=${newTitle}&priority=${newPriority}`);

  const updatedTodo = await db('todos').where('id', todo[0].id).first();

  t.is(updatedTodo.title, newTitle, 'Todo title should be updated');
  t.is(updatedTodo.priority, newPriority, 'Todo priority should be updated');
}, { timeout: 10000 });

test.serial('Delete todo', async (t) => {
  const todo = await db('todos').insert({ title: 'To be deleted' }).returning('*');

  await supertest(app).get(`/remove-todo/${todo[0].id}`);
  const deletedTodo = await db('todos').where('id', todo[0].id).first();

  t.is(deletedTodo, undefined, 'Todo should be deleted');
});

test.serial('Todo detail', async (t) => {
  const todo = await db('todos').insert({ title: 'Detail Test' }).returning('*');

  const response = await supertest(app).get(`/todo/${todo[0].id}`);
  t.assert(response.text.includes(todo[0].title), 'Todo detail should include the todo title');
}); 

test.serial('Create todo without title', async (t) => {
  const response = await supertest(app).post('/add-todo').send({ title: '' });
  t.is(response.status, 400, 'Should return status 400 for empty title');
});

test.serial('Todo detail with non-existent ID', async (t) => {
  const response = await supertest(app).get('/todo/9999'); // Předpokládáme, že takové ID neexistuje
  t.is(response.status, 404, 'Should return status 404 for non-existent todo ID');
});

test.serial('Create todo with extremely long title', async (t) => {
  const longTitle = 'a'.repeat(1000);
  const response = await supertest(app).post('/add-todo').send({ title: longTitle });
  t.is(response.status, 400, 'Should return status 400 for extremely long title');
});

test.serial('Update non-existent todo', async (t) => {
  const response = await supertest(app).post('/update-todo/9999').send({ title: 'New Title', priority: 'high' });
  t.is(response.status, 404, 'Should return status 404 for non-existent todo ID');
});

test.serial('Delete non-existent todo', async (t) => {
  const response = await supertest(app).get('/remove-todo/9999');
  t.is(response.status, 404, 'Should return status 404 for non-existent todo ID');
});

test.serial('Create todo with empty title and priority', async (t) => {
  const response = await supertest(app).post('/add-todo').send({ title: '', priority: '' });
  t.is(response.status, 400, 'Should return status 400 for empty title and priority');
});

test.serial('Access todo detail after deletion', async (t) => {
  const todo = await db('todos').insert({ title: 'Temporary Todo' }).returning('*');
  await supertest(app).get(`/remove-todo/${todo[0].id}`);
  const response = await supertest(app).get(`/todo/${todo[0].id}`);
  t.is(response.status, 404, 'Should return status 404 when accessing a deleted todo');
});