const express = require('express')
const Todo = require('../models/todo')
// const AuthorizationMiddleware = require('../middlewares/authorization')

module.exports = (db, amqpService) => {
  const router = express.Router()
  // const authorizationMiddleware = AuthorizationMiddleware(db)

  /**
   * Create endpoint with the list being created belongs to and 
   * can only be accessed by the creator or anyone added to access the list 
  */
  router.post('/', async (req, res, next) => {
    const uid = req.uid
    const { task } = req.body
    const newTodo = new Todo({ task, uid, access: [uid] })
    const todo = await db.insertTodo(newTodo)
    // await db.addUser(todo.uid, todo.id)
    res.status(201).send(todo)
  })

  /**
   * GET all TODO-list endpoint that would return an array of TODO-lists 
   * with their titles based on who the currently authenticated user is 
  */
  router.get('/me', async (req, res, next) => {
    const uid = req.uid
    const myTodos = await db.findMyTodos(uid)
    res.send(myTodos)
  })

  router.use('/:tid', require('../middlewares/authorization')(db))
  router.use('/:tid', require('../middlewares/deleteCheck')(db))

  /**
   * GET a single TODO-list by its ID endpoint that would return the corresponding 
   * TODO-list together with all of the items in the list based on who the current 
   * authenticated user is. Returns 403 forbidden with a proper error JSON object 
   * if the user cannot access the list
  */
  router.get('/:tid', async (req, res, next) => {
    const tid = req.params.tid
    const todo = await db.findTodo(tid)
    if (todo) {
      res.send(todo)
    } else {
      res.status(400).send(`Todo id ${tid} not found`)
    }
  })

  /**
   * PUT/PATCH endpoint to update a TODO-list’s title by its ID based on who the 
   * current authenticated user is. Returns 403 forbidden with a proper error 
   * JSON object if the user cannot access the list 
  */
  router.put('/:tid', async (req, res, next) => {
    const tid = req.params.tid
    const { task } = req.body
    const updatedTodo = new Todo({ task })
    const todo = await db.updateTodo(tid, updatedTodo)
    res.send(todo)
  })

  /**
   * DELETE endpoint to remove a TODO-list. Soft-delete should be used
  */
  router.delete('/:tid', async (req, res, next) => {
    const tid = req.params.tid
    const success = await db.deleteTodo(tid)
    if (success) {
      res.send(`Deleted todo ${tid} successfully`)
    } else {
      res.status(400).send(`Todo id ${tid} not found`)
    }
  })

  router.put('/:tid/addUser', async (req, res, next) => {
    const tid = req.params.tid
    const { username } = req.body
    
    await amqpService.addUser({ tid, username })
    res.send(`Sending request to add ${username}`)
  })

  router.get('/', async (req, res, next) => {
    const todos = await db.findAllTodos()
    res.send(todos)
  })

  return router
}
