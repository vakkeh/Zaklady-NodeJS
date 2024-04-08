import ejs from 'ejs'
import { WebSocketServer, WebSocket } from 'ws'
import db, { getAllTodos } from '../src/db.js'

/** @type {Set<WebSocket>} */
const connections = new Set()

export const createWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server })
  
      wss.on('connection', (ws) => {
        connections.add(ws)

        console.log('New connection', connections.size)
        ws.on('close', () => {
            connections.delete(ws)

            console.log('Closed connection', connections.size)
        })
      })
  }

  export const sendTodosToAllConnections = async () => {
    const todos = await db('todos').select('*')

    const html = await ejs.renderFile('views/_todos.ejs', {
        todos,
    })

    for (const connection of connections) {
        const message = {
            type: 'todos',
            html,
        }

        // JSON je globální objet a tak se nemusí importovat
        const json = JSON.stringify(message)

        connection.send(json)
    }
  }

  export const sendTodoDetailToAllConnections = async (todo) => {
    const message = {
      type: 'todo',
      todo,
    }
  
    const json = JSON.stringify(message)
  
    for (const connection of connections) {
      connection.send(json)
    }
  }

  export const sendTodoDeletedToAllConnections = async (todoId) => {
    const message = {
      type: 'deleted',
      todoId,
    }
  
    const json = JSON.stringify(message)
  
    for (const connection of connections) {
      connection.send(json)
    }
  }