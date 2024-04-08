import express from 'express'
// Defaultní a jmenné exporty je možné kombinovat 
import db, { getAllTodos } from './src/db.js'
import { createWebSocketServer, sendTodosToAllConnections, sendTodoDetailToAllConnections, sendTodoDeletedToAllConnections } from './src/websockets.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log('Incomming request', req.method, req.url)
  next()
})

app.get('/', async (req, res) => {
  const todos = await db().select('*').from('todos')

  res.render('index', {
    title: 'Todos',
    todos,
  })
})

app.get('/todo/:id', async (req, res, next) => {
  const todo = await db('todos').select('*').where('id', req.params.id).first()

  if (!todo) return next()

  res.render('todo', {
    todo,
  })

  sendTodoDetailToAllConnections(todo)
})

app.post('/add-todo', async (req, res) => {
  const todo = {
    title: req.body.title,
    done: false,
    priority: req.body.priority || 'normal', // Přidáváme priority s výchozí hodnotou 'normal'
  };

  await db('todos').insert(todo);

  sendTodosToAllConnections()

  res.redirect('/');
}); 

app.post('/update-todo/:id', async (req, res, next) => {
  const { title, priority } = req.body; // Získáváme priority z těla požadavku
  const todo = await db('todos').select('*').where('id', req.params.id).first();

  if (!todo) return next();

  await db('todos').update({ title, priority }).where('id', todo.id); // Aktualizujeme i priority

  sendTodoDetailToAllConnections(todo)
  sendTodosToAllConnections()

  res.redirect('back');
});

app.get('/remove-todo/:id', async (req, res) => {
  const todo = await db('todos').select('*').where('id', req.params.id).first()

  if (!todo) return next()

  await db('todos').delete().where('id', todo.id)

  sendTodoDetailToAllConnections(todo)
  sendTodosToAllConnections()
  sendTodoDeletedToAllConnections(req.params.id)

  res.redirect('/')
})

app.get('/toggle-todo/:id', async (req, res, next) => {
  const todo = await db('todos').select('*').where('id', req.params.id).first()

  if (!todo) return next()

  await db('todos').update({ done: !todo.done }).where('id', todo.id)

  sendTodoDetailToAllConnections(todo)
  sendTodosToAllConnections()

  res.redirect('back')
})

app.use((req, res) => {
  res.status(404)
  res.send('404 - Stránka nenalezena')
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500)
  res.send('500 - Chyba na straně serveru')
})

/*app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})*/

const server = app.listen(3000, () => {
  console.log(`Server listening at http://localhost:3000`)
})

createWebSocketServer(server)
