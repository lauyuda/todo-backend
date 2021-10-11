const Todo = require('../models/todo')

module.exports = (pool) => {
  const db = {}

  db.insertTodo = async (todo) => {
    const res = await pool.query(
      'INSERT INTO Todos (task,uid,access) VALUES ($1,$2,$3) RETURNING *',
      [todo.task, todo.uid, todo.access]
    )
    return new Todo(res.rows[0])
  }

  db.findMyTodos = async (myId) => {
    const res = await pool.query(
      'SELECT Todos.* FROM Todos WHERE $1 = ANY (access) AND softdelete = FALSE;',
      [myId]
    )
    return res.rows.map(row => new Todo(row).task)
  }
  
  db.findIsAccess = async (tid, uid) => {
    const res = await pool.query(
      'SELECT * FROM Todos WHERE id = $1 AND $2 = ANY (access)',
      [tid, uid]
    )
    return res.rowCount !== 0
  }
  
  db.findIsDeleted = async (tid) => {
    const res = await pool.query(
      'SELECT * FROM Todos WHERE id = $1 AND softdelete = FALSE',
      [tid]
    )
    return res.rowCount === 0
  }
  
  db.findTodo = async (id) => {
    const res = await pool.query(
      'SELECT * FROM Todos WHERE id = $1',
      [id]
    )
    return res.rowCount ? new Todo(res.rows[0]) : null
  }

  db.findAllTodos = async () => {
    const res = await pool.query(
      'SELECT task FROM Todos'
    )
    return res.rows.map(row => new Todo(row))
  }

  db.updateTodo = async (tid, todo) => {
    const res = await pool.query(
      'UPDATE Todos SET task=$2 WHERE id=$1 RETURNING *',
      [tid, todo.task]
    )
    return res.rowCount ? new Todo(res.rows[0]) : null
  }

  db.deleteTodo = async (id) => {
    const res = await pool.query(
      'UPDATE Todos SET softdelete=TRUE WHERE id=$1 RETURNING *',
      [id]
    )
    return res.rowCount > 0
  }

  db.updateTodosUserList = async (tid, uid) => {
    console.log('db', tid, uid)
    const res = await pool.query(
      'UPDATE Todos SET access = array_append(access, $2) WHERE id=$1 AND $2 NOT IN (SELECT UNNEST(access) from Todos WHERE id=$1) RETURNING *',
      [tid, uid]
    )
    return res.rowCount ? new Todo(res.rows[0]) : null
  }

  return db
}