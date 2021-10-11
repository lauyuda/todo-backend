require('dotenv').config()
const amqplib = require('amqplib')
const db = require('./db')

const URL = process.env.CLOUDAMQP_URL || 'amqp://localhost'
const QUEUE = 'addUser'

async function main () {
  const client = await amqplib.connect(URL)
  const channel = await client.createChannel()
  await channel.assertQueue(QUEUE)
  channel.consume(QUEUE, (msg) => {
    const data = JSON.parse(msg.content)
    const userExist = db.findUserIdByUsername(data.username)
    Promise.resolve(userExist).then((user) => {
      if (user) {
        db.updateTodosUserList(
          data.tid, 
          user
        ).then(() => {
          console.log('Added user')
          channel.ack(msg)
        }).catch((err) => {
          channel.nack(msg)
        })
      } else {
        console.log('Cannot add user')
        channel.ack(msg)
      }
    })
    return null
    
  })
}

main().catch(err => {
  console.log(err)
})