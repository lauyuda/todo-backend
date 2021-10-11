const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const db = {
  ...require('./todos')(pool),
  ...require('./users')(pool),
}

db.initialise = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      password_hash VARCHAR(100) NOT NULL
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Todos (
      id SERIAL PRIMARY KEY,
      task VARCHAR(100) NOT NULL,
      uid INTEGER NOT NULL,
      access INTEGER[] NOT NULL,
      softdelete BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (uid) REFERENCES Users(id)
    )
  `)
}

db.end = async () => {
  await pool.end()
}

module.exports = db