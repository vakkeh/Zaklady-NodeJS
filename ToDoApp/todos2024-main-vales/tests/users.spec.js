import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import db, { createUser, getUser } from '../src/db.js'

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial('create new user', async (t) => {
  const user = await createUser('name', 'password')

  t.is(user.name, 'name')
  t.not(user.hash, 'password')
})

test.serial('get user by name and password', async (t) => {
    const user = await createUser('name', '1234')
  
    t.deepEqual(await getUser('name', '1234'), user)
    t.notDeepEqual(await getUser('name', 'bad password'), user)
    t.notDeepEqual(await getUser('bad name', '1234'), user)
})

test.serial('GET /register shows registration from', async (t) => {
    const response = await supertest(app).get('/register')
  
    t.assert(response.text.includes('Registrace'))
})

test.serial('POST /register will create new user', async (t) => {
    await supertest(app).post('/register').type('form').send({ name: 'adam', password: '1234' })
  
    t.not(await getUser('adam', '1234'), null)
})

test.serial('after registration and redirect user name is visible', async (t) => {
    const agent = supertest.agent(app)
  
    const response = await agent.post('/register').type('form').send({ name: 'adam', password: '1234' }).redirects(1)
  
    t.assert(response.text.includes('adam'))
  })