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

test.serial('GET / lists todos', async (t) => {
    const title = 'Testovací todo!!!';
  
    await db('todos').insert({ title });
  
    const response = await supertest(app).get('/');
  
    t.assert(response.text.includes(title), 'response does not include ToDo text');
  });