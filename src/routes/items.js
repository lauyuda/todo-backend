const express = require('express')
const Item = require('../models/item')
const AuthorizationMiddleware = require('../middlewares/authorization')

module.exports = (db) => {
  const router = express.Router()
  const authorizationMiddleware = AuthorizationMiddleware(db)

  router.post('/', async (req, res, next) => {
    const uid = req.uid
    const { name, quantity } = req.body
    const newItem = new Item({ name, quantity, uid })
    const item = await db.insertItem(newItem)
    res.status(201).send(item)
  })

  router.get('/', async (req, res, next) => {
    const items = await db.findAllItems()
    res.send(items)
  })

  router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    const item = await db.findItem(id)
    if (item) {
      res.send(item)
    } else {
      res.status(400).send(`Item id ${id} not found`)
    }
  })

  router.put('/:id', authorizationMiddleware, async (req, res, next) => {
    const uid = req.uid
    const id = req.params.id
    const { name, quantity } = req.body
    const updatedItem = new Item({ name, quantity, uid })
    const item = await db.updateItem(id, updatedItem, uid)
    res.send(item)
  })

  router.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    const success = await db.deleteItem(id)
    if (success) {
      res.send(`Deleted item ${id} successfully`)
    } else {
      res.status(400).send(`Item id ${id} not found`)
    }
  })

  router.get('/user/:userId', async (req, res, next) => {
    const userId = req.params.userId
    const userItems = await db.findUserItems(userId)
    if (userItems) {
      res.send(userItems)
    } else {
      res.status(400).send(`User ${userId} not found`)
    }
  })

  return router
}
