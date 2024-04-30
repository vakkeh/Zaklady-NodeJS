// src/db.js
import knex from 'knex'
import crypto from 'crypto'
// Jelikož knexfile se už nenachází ve stejném adresáři,
// musíme upravit cestu importu. 
import knexfile from '../knexfile.js'

const db = knex(knexfile[process.env.NODE_ENV || 'development'])

// Jeden ze způsobů jak exportovat věci ze souboru je 'export default'
// Defaultní exporty se importují takto:
// import libovolnyNazev from './src/db.js'
export default db

// Nebo pouze 'export' takzvaný jmenný export
// Jmenný export se importuje takto:
// import { getAllTodos } from './src/db.js'
// kde musíme dodržet název getAllTodos, pokud se nám nehodí můžeme přejmenovat:
// import { getAllTodos as libovolnyNazev } from './src/db.js'
export const getAllTodos = async () => {
  const todos = await db('todos').select('*')

  return todos
}

export const createUser = async (name, password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  const token = crypto.randomBytes(16).toString('hex')

  const [user] = await db('users').insert({ name, salt, hash, token }).returning('*')

  return user
}

export const getUser = async (name, password) => {
  const user = await db('users').where({ name }).first()
  if (!user) return null

  const salt = user.salt
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  if (hash !== user.hash) return null

  return user
}

export const getUserByToken = async (token) => {
  const user = await db('users').where({ token }).first()

  return user
}